import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { LemmaClient, readSSE, parseSSEJson, parseAssistantStreamEvent } from 'lemma-sdk';

// ─── Token Retrieval ─────────────────────────────────────────────────────────
let cachedToken = '';
let lastFetched = 0;
function getApiToken(): string {
  const now = Date.now();
  if (cachedToken && (now - lastFetched < 300000)) { // 5 minutes cache
    return cachedToken;
  }
  try {
    cachedToken = execSync('lemma auth print-token', { encoding: 'utf-8' }).trim();
    lastFetched = now;
    return cachedToken;
  } catch (e) {
    return process.env.LEMMA_API_TOKEN || '';
  }
}

const serverAuthManager = {
  getRequestInit: (init: any = {}) => {
    const token = getApiToken();
    return {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  },
  isTokenMode: true,
  getBearerToken: () => getApiToken(),
  getState: () => ({ status: 'authenticated', user: null }),
  isAuthenticated: () => true,
  subscribe: () => () => { },
  checkAuth: async () => ({ status: 'authenticated', user: null }),
  markUnauthenticated: () => {
    console.warn('[Lemma Auth] markUnauthenticated was called.');
  },
  signOut: async () => true,
  getAuthUrl: () => '',
  getFederatedLogoutUrl: () => '',
  redirectToAuth: () => { },
  redirectToFederatedLogout: async () => { },
};

const lemma = new LemmaClient({
  apiUrl: process.env.LEMMA_API_URL || 'http://127.0.0.1:8711',
  authUrl: process.env.LEMMA_AUTH_URL || 'http://127.0.0.1:3711/auth',
  podId: process.env.LEMMA_POD_ID,
  timeoutMs: 120000,
}, {
  authManager: serverAuthManager as any
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function drainStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  let fullText = '';
  for await (const event of readSSE(stream)) {
    const payload = parseSSEJson(event);
    if (!payload) continue;
    const parsed = parseAssistantStreamEvent(payload);
    if (parsed.token && (!parsed.tokenKind || parsed.tokenKind === 'text')) {
      fullText += parsed.token;
    } else if (parsed.message && parsed.message.role === 'assistant' && parsed.message.text) {
      if (!fullText) {
        fullText = parsed.message.text;
      }
    }
  }
  return fullText.trim();
}

async function runPromptViaLemma(agentName: string, prompt: string): Promise<string> {
  const result = await lemma.agents.run(agentName, prompt, { stream: true });
  if (result instanceof ReadableStream) {
    return drainStream(result as ReadableStream<Uint8Array>);
  }
  const messages = await lemma.conversations.messages.list(
    (result as { id: string }).id,
    { limit: 1 }
  );
  const items = (messages as { items?: { content?: string }[] }).items ?? [];
  return items[0]?.content ?? '';
}

function extractJson<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = fenced ? fenced[1] : raw;
  const startIdx = jsonStr.search(/[{[]/);
  if (startIdx === -1) return null;
  const lastBracketIdx = jsonStr.lastIndexOf(']');
  const lastBraceIdx = jsonStr.lastIndexOf('}');
  const endIdx = Math.max(lastBracketIdx, lastBraceIdx);
  if (endIdx === -1 || endIdx < startIdx) return null;
  jsonStr = jsonStr.slice(startIdx, endIdx + 1);
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!getApiToken()) {
    return NextResponse.json({ error: 'Authentication token missing for Lemma SDK' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[Upload API] Received file upload: ${file.name} (${file.size} bytes)`);

    // 1. Convert File to Blob and upload to Lemma File Datastore
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // Ensure the documents folder exists
    try {
      await lemma.files.folder.create('documents', { directoryPath: '/' });
    } catch {
      // Ignored if already exists
    }

    const filePath = `/documents/${file.name}`;
    let fileDetail;
    try {
      fileDetail = await lemma.files.upload(blob, {
        name: file.name,
        directoryPath: '/documents',
        searchEnabled: true,
        description: `Uploaded document: ${file.name}`
      });
    } catch (uploadErr: any) {
      // If conflict error, try deleting and uploading again
      if (
        uploadErr.code === 'DATASTORE_CONFLICT' ||
        uploadErr.statusCode === 409 ||
        (uploadErr.message && uploadErr.message.includes('already exists'))
      ) {
        console.warn(`[Upload API] File ${filePath} already exists. Deleting and re-uploading...`);
        try {
          await lemma.files.delete(filePath);
          fileDetail = await lemma.files.upload(blob, {
            name: file.name,
            directoryPath: '/documents',
            searchEnabled: true,
            description: `Uploaded document: ${file.name}`
          });
        } catch (retryErr: any) {
          console.error(`[Upload API] Retry upload failed:`, retryErr);
          throw retryErr;
        }
      } else {
        throw uploadErr;
      }
    }

    console.log(`[Upload API] File uploaded successfully to Lemma. ID: ${fileDetail.id}`);

    // 2. Extract parsed Markdown/text content of the file
    let parsedText = '';
    try {
      const markdownBlob = await lemma.files.children.markdown(`/documents/${file.name}`);
      parsedText = await markdownBlob.text();
    } catch (err) {
      console.warn(`[Upload API] Could not extract markdown from path '/documents/${file.name}'. Trying fallback children content API...`);
      try {
        const contentBlob = await lemma.files.children.content(`/documents/${file.name}`);
        parsedText = await contentBlob.text();
      } catch (err2) {
        console.error('[Upload API] Fallback children content extraction failed.', err2);
      }
    }

    if (!parsedText.trim()) {
      parsedText = `Document: ${file.name}\nSize: ${file.size} bytes\n(Automatic text extraction yielded empty content)`;
    }

    console.log(`[Upload API] Text extraction complete. Excerpt size: ${parsedText.length} characters.`);

    // 3. Digest the PDF text into a high-quality Knowledge Thought using streambrain-classifier
    const prompt = `
You are StreamBrain's document parsing pipeline. A user has uploaded a PDF document named "${file.name}".
Your task is to digest the document contents and return ONLY a valid JSON object matching the Thought schema. 
Provide a comprehensive outline, main points, summary, and action points in the content field. Keep it rich and detailed.

Return ONLY a valid JSON object — no prose, no explanation, no markdown fences:

{
  "type": "knowledge",
  "content": "Document: ${file.name}\\n\\n## Summary\\n<A rich summary of the PDF content>\\n\\n## Key Takeaways\\n<Detailed bulleted list of key takeaways, main findings, and metrics from the text>\\n\\n## Core Concepts\\n<Explanation of main conceptual models discussed>",
  "priority": "low",
  "deadline": null,
  "insights": "<one-sentence sharp meta-insight about the significance of this PDF's knowledge>",
  "nextSteps": ["<suggested action item 1 based on document>", "<suggested action item 2>", "<suggested action item 3>"],
  "tags": ["pdf", "document", "${file.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)}"]
}

Here is the extracted document text content:
"""
${parsedText.slice(0, 10000)}
"""
`.trim();

    const raw = await runPromptViaLemma('streambrain-classifier', prompt);
    const parsedThought = extractJson<any>(raw);

    if (!parsedThought) {
      throw new Error(`Failed to classify/structure PDF content. LLM output: ${raw}`);
    }

    // 4. Create database record in the "documents" table first to get its ID
    const docRecord = await lemma.records.create("documents", {
      title: file.name,
      file_path: `/documents/${file.name}`,
      status: 'processed',
      summary: parsedThought.insights || ''
    });

    // 5. Create database record in the "thoughts" table linked to the document
    const record = await lemma.records.create("thoughts", {
      title: file.name.slice(0, 50),
      content: parsedThought.content,
      type: 'knowledge',
      x: 0,
      y: 0,
      priority: 'low',
      deadline: null,
      insights: parsedThought.insights || '',
      next_steps: parsedThought.nextSteps || [],
      tags: parsedThought.tags || ['pdf', 'document'],
      completed: false,
      document_id: docRecord.id,
      source: file.name
    });

    console.log(`[Upload API] Created thought record ${record.id} and document entry.`);

    return NextResponse.json({
      ok: true,
      record: {
        id: record.id,
        type: 'knowledge',
        content: record.content,
        createdAt: new Date(record.created_at || Date.now()),
        completed: false,
        priority: 'low',
        nextSteps: record.next_steps || [],
        insights: record.insights || '',
        connections: [],
      }
    });

  } catch (err: any) {
    console.error('[Upload API] Fatal error handling file upload:', err);
    return NextResponse.json({ error: 'File upload processing failed', detail: err.message }, { status: 502 });
  }
}
