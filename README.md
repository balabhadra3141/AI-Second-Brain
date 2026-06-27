# StreamBrain — Your Invisible AI Second Brain

StreamBrain is a modern, premium-look personal knowledge-management web application. It integrates note-taking, task management, dynamic relationships mapping, and real-time AI capabilities into a single cohesive experience.

## 🚀 Key Features

1. **Interactive Dashboard**:
   - Organize notes, tasks, and learnings visually as light-mode surface-raised cards.
   - Reorder, group, or merge cards directly. Merging cards automatically synthesizes a summarized, cohesive card.
   - Robust search functionality to filter thoughts in real time.

2. **AI-Powered Chat**:
   - Engage with your second brain using natural language.
   - Provides accurate inline citations (knowledge source, original tasks, ideas) mapped directly to your notes.
   - Supports persistent conversation histories.

3. **Knowledge Graph**:
   - A highly interactive SVG-based graph visualization mapping connections between thoughts.
   - Styled with a premium dotted-grid background synced fully to light and dark theme variables.

4. **Left Sidebar Panel**:
   - Collapsible panel showcasing upcoming tasks and proactive AI insights.
   - Smooth transitions and persisted layout states.

5. **Document & PDF Upload Ingestion**:
   - Upload PDFs, text files, or images.
   - Automatic text/markdown extraction with an AI classification pipeline storing files directly to the Lemma datastore.
   - Graceful overwrite handling for duplicate files to ensure robust uploads.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS variables, animations, glassmorphism)
- **Integration**: Lemma SDK (`lemma-sdk`) for LLM agents, file uploads, and datastore management

---

## ⚙️ Setup and Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- [Lemma CLI](https://github.com/lemma-ai/lemma) authenticated to your workspace.

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
LEMMA_API_URL=http://127.0.0.1:8711
LEMMA_API_TOKEN=your-lemma-api-token
NEXT_PUBLIC_THEME=light
```

### 4. Running the Development Server
Use the bypassed command if scripting is restricted on Windows/PowerShell:
```bash
powershell -ExecutionPolicy Bypass -Command "npm run dev"
# Or standard command:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Production Build
Build the optimized application:
```bash
powershell -ExecutionPolicy Bypass -Command "npm run build"
# Or standard command:
npm run build
```

---

## 🧪 Verification & Development

Comprehensive project guidelines, code structures, and verification checklists are detailed in [project.md](./project.md).

---
*Created and maintained as a part of the AI Second Brain project.*
