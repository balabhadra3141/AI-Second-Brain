import { NextResponse } from 'next/server';
import { LemmaClient } from 'lemma-sdk';
import { execSync } from 'child_process';

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
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  },
  isTokenMode: true,
  getBearerToken: () => getApiToken(),
  getState: () => ({ status: 'authenticated', user: null }),
  isAuthenticated: () => true,
  subscribe: () => () => {},
  checkAuth: async () => ({ status: 'authenticated', user: null }),
  markUnauthenticated: () => {},
  signOut: async () => true,
  getAuthUrl: () => '',
  getFederatedLogoutUrl: () => '',
  redirectToAuth: () => {},
  redirectToFederatedLogout: async () => {},
};

const lemma = new LemmaClient({
  apiUrl: process.env.LEMMA_API_URL || 'http://127.0.0.1:8711',
  authUrl: process.env.LEMMA_AUTH_URL || 'http://127.0.0.1:3711/auth',
  podId: process.env.LEMMA_POD_ID || '019f0706-063e-71a5-8fbe-ce726b3dabbf',
  timeoutMs: 120000,
}, {
  authManager: serverAuthManager as any
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const blob = await lemma.files.download(path);
    const arrayBuffer = await blob.arrayBuffer();
    
    let mimeType = 'application/octet-stream';
    const lowerPath = path.toLowerCase();
    if (lowerPath.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (lowerPath.endsWith('.png')) mimeType = 'image/png';
    else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) mimeType = 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error: any) {
    console.error('[Files Proxy API] Error fetching file:', error);
    return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
  }
}
