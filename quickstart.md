# StreamBrain Quickstart

## What is this app about?
StreamBrain is an AI-powered "second-brain" web application designed to capture, classify, and organize your raw thoughts into a spatial knowledge graph. It provides a beautiful, modern UI (built with Next.js, Framer Motion, and TailwindCSS) featuring a spatial grid, semantic minimap, command palette, and a time scrubber.

Under the hood, StreamBrain leverages the **Lemma SDK** to process and query your thoughts. When you capture a thought or ask a question (using `?` in the command palette), the app talks to a local Lemma "pod" which classifies the data, extracts actionable insights (like deadlines and next steps), and answers your natural-language questions.

## What's implemented?
The repository contains both the frontend application and the backend AI agent configurations:

1. **Next.js Frontend (`src/`)**:
   - A complete UI including `SpatialGrid`, `CommandPalette`, `SemanticMinimap`, and `TimeScrubber`.
   - Global shortcuts (Cmd+K / Ctrl+K) to open the command palette.
   - Timeline filtering and spatial navigation to explore your thoughts over time.
   - Lemma SDK integration for natural language queries and thought processing.

2. **Lemma Pod & Agents (`streambrain/` & `agents/`)**:
   - **StreamBrain Classifier**: Analyzes raw thoughts and classifies them into `task`, `idea`, or `knowledge`, extracting priorities, deadlines, tags, and AI-generated insights.
   - **QA Agent**: Handles questions asked against the spatial grid's data.
   - **Synthesizer Agent**: Synthesizes related thoughts.
   - **Connector Agent**: Base setup for connecting to external accounts/data.

## How to set up everything

### 1. Setup the Next.js Frontend
First, install the required dependencies and start the development server:

```bash
# Install dependencies
npm install

# Start the frontend dev server
npm run dev
```
The application will be running at [http://localhost:3000](http://localhost:3000).

### 2. Setup the Lemma Pod (AI Backend)
StreamBrain relies on a Lemma pod to handle AI operations. You need to import the pod bundle using the Lemma CLI.

```bash
# Validate the pod bundle (dry run)
lemma pods import ./streambrain --dry-run

# Upsert the pod into your local Lemma stack
lemma pods import ./streambrain
```

### 3. Post-Import Configurations
After importing the pod, you may want to configure additional settings based on your needs:
- **Upload files (optional)**: `lemma files upload ./doc.pdf /pod/knowledge/doc.pdf`
- **Connect accounts (optional)**: `lemma connectors ...`
- **Activate schedules/surfaces**: Flip them to active in your Lemma dashboard or CLI once targets exist.

### 4. Verify the setup
You can verify that your AI backend is running properly by querying the pod directly:

```bash
lemma pods describe
lemma agents chat hello "what can you do in this pod?"
```
