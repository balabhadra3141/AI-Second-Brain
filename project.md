# Project Documentation – AI‑Second‑Brain (StreamBrain)

## Table of Contents
1. [Overview](#overview)
2. [Lemma Setup Guide](#lemma-setup-guide)
3. [Core Functionalities](#core-functionalities)
   - [1️⃣ StreamBrain Dashboard & Spatial Grid](#1-streambrain-dashboard--spatial-grid)
   - [2️⃣ Second‑Brain Chat](#2-second-brain-chat)
   - [3️⃣ Knowledge Graph](#3-knowledge-graph)
   - [4️⃣ File Ingestion & PDF Processing](#4-file-ingestion--pdf-processing)
   - [5️⃣ AI OCR Handwriting & Math Scanner](#5-ai-ocr-handwriting--math-scanner)
   - [6️⃣ Voice Recording & 60fps Visualizer](#6-voice-recording--60fps-visualizer)
   - [7️⃣ Task & Insight Sidebar](#7-task--insight-sidebar)
   - [8️⃣ Settings Drawer (Appearance, Vault, Intelligence)](#8-settings-drawer-appearance-vault-intelligence)
   - [9️⃣ Time Scrubber & Semantic Minimap](#9-time-scrubber--semantic-minimap)
   - [🔟 API & Authentication Layer](#-api--authentication-layer)
4. [How to Verify / Demo Each Feature](#how-to-verify--demo-each-feature)
5. [Running the Project Locally](#running-the-project-locally)
6. [Build & Deployment Notes](#build--deployment-notes)
7. [Future Enhancements](#future-enhancements)

---

## Overview
**AI‑Second‑Brain** (branded as *StreamBrain*) is a premium personal knowledge‑management system built with **Next.js 16 (TurboPack)**, **React**, **TypeScript**, and **vanilla Tailwind-free CSS**. It enables users to capture, map, scan, and converse with their personal notes, ideas, documents, and tasks through visual cards, dynamic graphs, voice inputs, and optical scanners.

The project lives under `c:\Users\balab\OneDrive\Desktop\Works\AI-Second-Brain`.

---

## Lemma Setup Guide

To connect the application to the Lemma service and initialize your personal second brain workspace, follow these setup steps:

### 1. Authenticate the CLI
Log in via the browser using the Lemma CLI. This will authorize your terminal and generate the necessary credentials on your machine:
```bash
lemma auth login
```

### 2. Create the Pod
Create a new pod specifically for the StreamBrain application named `streambrain`:
```bash
lemma pod create streambrain
```

### 3. Import Local Pod Resources
Import the pre-configured local resource bundle (schema, tables, and agents stored inside the `./streambrain` directory) into your newly created pod:
```bash
lemma pod import streambrain --pod streambrain
```

### 4. Fetch your Pod ID
To find your new pod's UUID, run:
```bash
lemma pod get streambrain
```
Use this UUID value to update `LEMMA_POD_ID` in your `.env.local` configuration.

---

## Core Functionalities

### 1️⃣ StreamBrain Dashboard & Spatial Grid
- **Thoughts Workspace**: Display thoughts as drag-and-drop cards positioned on an infinite 2D grid.
- **Card Merging**: Dragging one card over another prompts a merge. The system routes the context through the `streambrain-synthesizer` agent to merge both cards into one rich, cohesive summary thought.
- **DropZone Overlay**: Drag files directly from your computer anywhere onto the dashboard to activate the upload overlay.

### 2️⃣ Second‑Brain Chat
- **Citation Tooltips**: Interactive chat interface where AI responses cite sources from your workspace (`[1]`, `[2]`). Hovering over citation tags opens tooltips containing details on the cited card (title, content, type).
- **Persistent Conversation**: Chat history is cached in the client's `localStorage` so messages persist on reload.

### 3️⃣ Knowledge Graph
- **Dotted Grid Background**: Visual map styled with a HSL custom theme and an SVG `<circle>` pattern spacing dots at 28px intervals.
- **Interactive Nodes**: Visualizes relationships between thoughts. Nodes are clickable, zooming the workspace straight to the selected card's grid coordinates.

### 4️⃣ File Ingestion & PDF Processing
- **File Upload Endpoint**: Accepts PDF, text, and image uploads.
- **Datastore Storage**: Files are saved directly to `/documents` in the Lemma Files Datastore.
- **Graceful File Overwrite**: Deletes duplicate files at the path before uploading, resolving database conflict errors.
- **Extraction & Classification**: Fallback APIs extract clean markdown text. The `streambrain-classifier` agent processes the file text to create a structured thought.

### 5️⃣ AI OCR Handwriting & Math Scanner
- **PDF Canvas Extraction**: Renders the first page of an uploaded PDF file onto an off-screen `HTMLCanvasElement` at a 2.0 scale to keep math notation crisp.
- **Vision Model API**: Sends the base64 PNG data URL to `/api/ocr`, using `openai/gpt-4o-mini` on OpenRouter to transcribe handwriting and LaTeX equations.

### 6️⃣ Voice Recording & 60fps Visualizer
- **Web Audio Analyser**: Uses native `AudioContext` and `AnalyserNode` to capture mic signals.
- **60fps Animation**: Bypasses React state update costs by updating the heights of a 24-bar frequency visualizer directly in the DOM.
- **SpeechRecognition**: Direct browser transcription writes recognized words to thoughts.

### 7️⃣ Task & Insight Sidebar
- **Collapsible Panel**: Left sidebar holding insights and tasks.
- **Workspace Analytics**: Triggers the `streambrain-insight` agent to audit notes and output insights like missing information warnings or task deadline notifications.

### 8️⃣ Settings Drawer (Appearance, Vault, Intelligence)
- **Appearance**: Customize font styles (sans, serif, JetBrains Mono code), variables, radii, and widths.
- **Intelligence**: Modify LLM model properties and access keys.
- **Vault**: View database schemas and statistics for thoughts, documents, insights, relationships, etc.

### 9️⃣ Time Scrubber & Semantic Minimap
- **Time Scrubber**: Navigate thought capturing history on a timeline.
- **Semantic Minimap**: Provides a map of thoughts categorized semantically.

### 🔟 API & Authentication Layer
- **Auth Fallback**: Bypasses cookies via server-side Bearer authorization headers from `lemma auth print-token` or `LEMMA_API_TOKEN`.
- **Extended Timeout**: Set `timeoutMs` to 120 seconds to prevent heavy agent processes from timing out.

---

## How to Verify / Demo Each Feature

### 1️⃣ Verify Dashboard & Juggling
1. Run `npm run dev` and navigate to `http://localhost:3000/`.
2. Grab a card and drag it around the grid. Drag it over another card.
3. Confirm the "Merge Thoughts" modal is triggered. Clicking "Merge" should replace both cards with a single synthesized card containing a summary.
4. Drag a PDF file onto the page – verify that the `DropZoneOverlay` appears, blocking the page with an "Upload file" prompt.

### 2️⃣ Verify Second‑Brain Chat
1. Click the **Chat** tab.
2. Ask: *"What thoughts do I have saved?"*
3. The response should feature inline citations (`[1]`). Hovering over them should show a card tooltip with source metadata.

### 3️⃣ Verify Knowledge Graph
1. Go to the **Knowledge Graph** tab.
2. Confirm that the background displays a dotted pattern.
3. Click a node in the graph; the view should navigate to the thought dashboard and center on the clicked card.

### 4️⃣ Verify File Ingestion & Duplicate Overwrite
1. Upload a PDF from the file browser.
2. Verify that it parses and creates a thought.
3. Upload the exact same file again. Confirm it succeeds without crashing (resolving the previous `ConflictError` by deleting the old file first).

### 5️⃣ Verify AI OCR Handwriting & LaTeX Scanner
1. Open the **OCR Scanner** overlay.
2. Drag/select an image or PDF containing handwriting or mathematical equations.
3. Verify that the system transcribes it accurately using OpenRouter's vision model, printing mathematical formulas correctly.

### 6️⃣ Verify Voice Recording Visualizer
1. Click the microphone icon to record a voice thought.
2. Talk into the mic and verify that the 24 spectrum bars animate smoothly.
3. Stop recording and verify that the transcribed text is written directly into your input.

### 7️⃣ Verify Sidebar & Insights
1. Open the sidebar from the left edge.
2. Click **Run Insights** and verify that StreamBrain generates insights based on the active notes.
3. Toggle the sidebar and confirm that reloading the page keeps the sidebar in its toggle state (`sessionStorage`).

### 8️⃣ Verify Drawer & Vault Specs
1. Click the settings gear icon to open the configuration drawer.
2. Go to the **Vault** tab and inspect database stats, count records, and examine column types.
3. Go to the **Appearance** tab, toggle a font or radius size, and verify that styles change immediately.

---

## Running the Project Locally
```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env.local and fill:
# LEMMA_API_URL=https://api.lemma.work
# LEMMA_AUTH_URL=https://lemma.work/auth
# LEMMA_POD_ID=YOUR_LEMMA_POD_ID
# OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY

# Start development server
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

---

## Build & Deployment Notes
- **Production Compilation**: `powershell -ExecutionPolicy Bypass -Command "npm run build"`
- **Start production server**: `npm run start`

---

## Future Enhancements
- Offline persistence using local IndexedDB.
- Graph edge distinction (differentiating task dependencies from document associations).

---
*This documentation was generated on 2026‑06‑29 by Antigravity, the AI‑powered coding assistant.*
