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
- [Lemma CLI](https://github.com/lemma-ai/lemma) installed.

### 2. Lemma Setup & Pod Initialization
Set up your workspace inside Lemma:

1. **Login**:
   ```bash
   lemma auth login
   ```
2. **Create Pod**:
   Create a new pod named `streambrain`:
   ```bash
   lemma pod create streambrain
   ```
3. **Import Setup Bundle**:
   Import the pre-configured local schema and agents:
   ```bash
   lemma pod import streambrain --pod streambrain
   ```
4. **Get Pod ID**:
   Retrieve the UUID of your new pod:
   ```bash
   lemma pod get streambrain
   ```
   Copy the ID and use it as `YOUR_LEMMA_POD_ID` in step 4 below.

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
LEMMA_API_URL=https://api.lemma.work
LEMMA_AUTH_URL=https://lemma.work/auth
LEMMA_POD_ID=YOUR_LEMMA_POD_ID
```

### 5. Running the Development Server
Use the bypassed command if scripting is restricted on Windows/PowerShell:
```bash
powershell -ExecutionPolicy Bypass -Command "npm run dev"
# Or standard command:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 6. Production Build
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
