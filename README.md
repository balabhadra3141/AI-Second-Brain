# 🧠 StreamBrain
**A spatial, AI-powered Second Brain that makes intelligence tactile.**

*(Insert placeholder for a Demo Video or Hero Image here)*

## 🌟 The Vision
Traditional note-taking apps force your brain into rigid folders, linear lists, and endless markdown files. They capture your ideas but do nothing to help you connect, synthesize, or evolve them. StreamBrain fundamentally reimagines personal knowledge management by treating your thoughts as physical, tactile objects that live on a fluid spatial operating system. 

Instead of typing in a static text box, you toss ideas onto an infinite canvas. StreamBrain's local AI engine instantly catches them, automatically classifying them as tasks, ideas, or permanent knowledge. You can then physically drag related concepts together, merging them to synthesize entirely new insights. It’s not just a digital notebook—it’s a dynamic, interactive thought-partner that actually helps you think better.

## 🚀 Hackathon Highlights (Killer Features)
* **Drag-and-Drop Semantic Synthesis:** Bypassing standard UI buttons, users physically drag and drop thought cards onto one another. The Next.js frontend calculates the pointer collision and fires the combined text to the local Lemma SDK to seamlessly synthesize a new, upgraded thought.
* **Client-Side WebAssembly OCR:** Digitizes handwritten notes and PDFs entirely in the browser using `tesseract.js` and `pdfjs-dist`. It extracts the text locally for zero-cost, zero-latency processing before handing it to the Lemma agent for classification.
* **Fluid Voice Visualizer:** A custom Web Audio API integration that captures frequency data and mutates the DOM directly (bypassing React render lag) for a highly responsive voice-to-text pipeline.
* **Semantic Mini-Map:** A highly optimized `IntersectionObserver` scrolling radar that tracks visible cards and allows for smooth navigation across the fluid masonry grid.

## 🏗️ Architecture: The Brain & The Body
StreamBrain is built on a clean architectural split between the "Brain" and the "Body". 

The **"Body"** is the frontend, built with Next.js 16 and Framer Motion. It provides the fluid, tactile user interface—the spatial grid, the drag-and-drop physics, the mini-map, and the document viewer. It is incredibly responsive, offloading heavy DOM manipulations and animations to hardware acceleration.

The **"Brain"** is powered entirely by the **Lemma SDK**. Running completely locally, the Lemma agent intercepts every note, image, or voice transcript from the frontend. It handles all the heavy lifting: semantic classification (Task/Idea/Knowledge), contextual Q&A, and insight synthesis. Because the Brain runs via Lemma SDK on the host environment, StreamBrain operates with zero reliance on paid cloud LLM APIs, ensuring total privacy, offline capability, and zero recurring latency costs for your personal knowledge base.

## 💻 Tech Stack
* **Frontend:** Next.js 16 (App Router), React, TypeScript
* **Styling & Animation:** Tailwind CSS, Framer Motion
* **AI & Intelligence Engine:** Lemma SDK
* **Client-Side Processing:** Tesseract.js (OCR), pdfjs-dist

## 📂 Project Structure
```
/src
├── /app
│   ├── /api          # Backend routes (Lemma SDK integration, OCR proxy, files)
│   └── page.tsx      # Main application entry point and tab navigation
├── /components       # UI Building Blocks
│   ├── /cards        # Idea, Knowledge, and Task card components
│   ├── /drawer       # Sidebar configuration and appearance panels
│   └── (others)      # Modals, OCRScanner, KnowledgeGraph, SemanticMinimap
├── /hooks            # Custom React Hooks
│   ├── useThoughts.ts   # Manages global state and Lemma datastore synchronization
│   ├── useDocuments.ts  # Handles file uploads, PDF fetching, and document state
│   └── (others)      # Local storage settings, spatial navigation, timeline filters
├── /lib              # Utility functions and helper classes
└── types.ts          # Global TypeScript interfaces for Thoughts, Tasks, and Documents
```

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
Use the bypassed command if scripting is restricted on Windows/PowerShell (this ensures maximum compatibility for judging):
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

## 🌐 Deployment
This project is configured for seamless deployment via Vercel on the `AI-Second-Brain` repository. Just link your GitHub repository to a Vercel project, add your `LEMMA_*` environment variables in the Vercel dashboard, and deploy.
