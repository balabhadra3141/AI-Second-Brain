# 🧠 StreamBrain — Your Invisible AI Second Brain

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js Badge" />
  <img src="https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react&logoColor=white" alt="React Badge" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge" />
  <img src="https://img.shields.io/badge/Lemma_SDK-0.5.2-purple?style=for-the-badge&logo=platform&logoColor=white" alt="Lemma SDK Badge" />
  <img src="https://img.shields.io/badge/OpenRouter-GPT--4o--mini-orange?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter Badge" />
</p>

StreamBrain is a modern, high-fidelity personal knowledge-management platform that acts as a secure, local, and semantic second brain. It integrates note-taking, task management, relationship mapping, voice recording, handwriting OCR, and advanced AI agent capabilities into a cohesive, premium interface.

---

## ✨ Core Features

### 🗂️ 1. Interactive Spatial Grid Dashboard
*   **Thoughts Workspace**: View notes, tasks, and speculative ideas as premium, light-mode surface-raised cards.
*   **Drag-and-Drop Juggling**: Freely arrange thought cards on a two-dimensional grid to reflect your mental associations.
*   **Cohesive Merging**: Drag one card onto another to prompt a **Merge**. StreamBrain automatically invokes the `streambrain-synthesizer` agent to synthesize both cards into a single, rich summary card.
*   **Inline Editing**: Double-click titles or content to edit thoughts instantly.
*   **Export/Import**: Batch-export selected cards as formatted JSON or import external files.

### 💬 2. Second Brain Chat (with Citations)
*   **Natural Language Q&A**: Chat directly with your second brain using a dedicated interface.
*   **Citations Mapped to Sources**: AI replies feature inline numerical citations (e.g., `[1]`, `[2]`). Hovering over a citation reveals a rich tooltip displaying the card title, content excerpt, and type (knowledge, idea, task).
*   **Persistent Histories**: Conversations are persisted in `localStorage` so you can continue your chats after reloading the page.

### 🕸️ 3. Dotted-Grid Knowledge Graph
*   **Dynamic Relationship Map**: Visualize links and nodes connecting thoughts, tasks, and documents in real time.
*   **Premium Dotted Background**: An SVG `<pattern>` grid with circles at 28px intervals styled with HSL custom themes.
*   **Clickable Mappings**: Click on graph nodes to open and zoom directly to the respective card on the spatial grid.
*   **Theme Syncing**: Full sync with light and dark mode switches.

### 📊 4. Proactive AI Insights & Task Sidebar
*   **Slide-Out Side Panel**: A collapsible left-hand sidebar containing pending tasks and AI-generated insights.
*   **Proactive Prompts**: Run the `streambrain-insight` agent to analyze your current dashboard state and extract high-level patterns, contradiction alerts, or suggestions (e.g., *"You have a deadline conflict on task X"*).
*   **State Persistence**: Side menu toggles persist state across reloads via `sessionStorage`.

### 📂 5. Document & PDF Ingestion (Lemma SDK)
*   **Automatic Text Extraction**: Upload PDFs, text files, or images. StreamBrain uploads the file to the Lemma Files Datastore (`/documents`) and uses the children markdown/content APIs to extract the text.
*   **AI Classification**: Extracted text is digested by the `streambrain-classifier` agent, generating a structured thought card complete with insights, next steps, and meta tags.
*   **Graceful Conflict Overwrites**: Automatically checks for existing files at the destination path. If a name conflict occurs, it deletes the outdated file first, ensuring a clean, crash-free re-upload.

### 🔍 6. AI OCR Handwriting & Math Scanner
*   **PDF Canvas Rendering**: Renders the first page of any uploaded PDF to an off-screen `HTMLCanvasElement` at a high scale (2.0) to maintain crisp character lines.
*   **OpenRouter Vision OCR**: Converts the canvas to a base64 PNG data URL and uploads it to the `/api/ocr` endpoint, utilizing `openai/gpt-4o-mini` on OpenRouter to transcribe handwriting, text, and mathematical LaTeX formulas exactly as they appear.

### 🎙️ 7. Voice Recording & 60fps Visualizer
*   **Web Audio API Integration**: Uses a native `AudioContext` and `AnalyserNode` to capture raw microphone inputs.
*   **Real-Time Visualizer**: Animates a 60fps, 24-bar frequencies spectrum directly using DOM manipulation to bypass React render overhead.
*   **Speech-to-Text Transcription**: Connects to the browser's `SpeechRecognition` interface to output voice thoughts in real time.

### ⚙️ 8. Settings & Vault Drawer
Open the config panel to access multi-tab management sections:
*   **Appearance**: Adjust fonts (Inter, Newsreader, JetBrains Mono), border radius, CSS variables, and spacing presets.
*   **Intelligence**: Set agent temperatures, model limits, and manage token credentials.
*   **Vault**: View database statistics, live database table counts, and inspect database schemas for tables (`thoughts`, `documents`, `tasks`, `insights`, `relationships`).

### ⏱️ 9. Time Scrubber & Semantic Minimap
*   **Time Scrubber**: A chronological slider allowing users to scrub back and forth through thought capture history.
*   **Semantic Minimap**: A clustered thumbnail view mapping the density and location of semantic thought nodes across the grid.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router, Turbopack)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & custom Vanilla CSS (CSS variables, glassmorphism)
*   **Local DB / Storage**: SQLite, synced local databases (`tasks.json`, `documents.json`)
*   **Lemma Integration**: Lemma SDK (`lemma-sdk`) for table records, custom agent invocations, and files datastores.
*   **Vision Model**: `openai/gpt-4o-mini` (via OpenRouter API)

---

## ⚙️ Setup and Installation

### 1. Prerequisites
- **Node.js**: Version 18 or higher.
- **Lemma CLI**: Installed on your system.

### 2. Lemma Setup & Pod Initialization

> [!IMPORTANT]
> The application requires a configured Lemma Pod with StreamBrain resources. Run these CLI commands before launching the app:

1. **Login**:
   ```bash
   lemma auth login
   ```
2. **Create Pod**:
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
   Copy the ID and place it in the `.env.local` file as `LEMMA_POD_ID`.

### 3. Installation
Install NPM dependencies:
```bash
npm install
```

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
LEMMA_API_URL=https://api.lemma.work
LEMMA_AUTH_URL=https://lemma.work/auth
LEMMA_POD_ID=YOUR_LEMMA_POD_ID
OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
```

### 5. Running the Development Server

> [!TIP]
> If PowerShell script execution is restricted on your Windows system, bypass it with the command below:

```bash
in powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
# in cmd or terminal
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
Compile and build the optimized production package:
```bash
# in powershell
powershell -ExecutionPolicy Bypass -Command "npm run build"
# in cmd or terminal
npm run build
```

---

## 🧪 Verification & Guidelines

A comprehensive overview of features, testing procedures, file structures, and verification checkmarks is maintained in [project.md](./project.md).

---
*Created and maintained as a part of the AI Second Brain project.*
