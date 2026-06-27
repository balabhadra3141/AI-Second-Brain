# Project Documentation – AI‑Second‑Brain (StreamBrain)

## Table of Contents
1. [Overview](#overview)
2. [Core Functionalities](#core-functionalities)
   - [1️⃣ StreamBrain Dashboard](#streambrain-dashboard)
   - [2️⃣ Second‑Brain Chat](#second-brain-chat)
   - [3️⃣ Knowledge Graph](#knowledge-graph)
   - [4️⃣ File Upload & PDF Processing](#file-upload--pdf-processing)
   - [5️⃣ Task & Insight Sidebar](#task--insight-sidebar)
   - [6️⃣ Theme & UI Consistency](#theme--ui-consistency)
   - [7️⃣ API & Authentication Layer](#api--authentication-layer)
   - [8️⃣ Data Persistence (SQLite / Lemma SDK)](#data-persistence)
3. [How to Verify / Demo Each Feature](#how-to-verify--demo-each-feature)
4. [Running the Project Locally](#running-the-project-locally)
5. [Build & Deployment Notes](#build--deployment-notes)
6. [Future Enhancements](#future-enhancements)

---

## Overview
**AI‑Second‑Brain** (also branded as *StreamBrain*) is a modern, premium‑look personal knowledge‑management web app built with **Next.js 16 (TurboPack)**, **React**, **TypeScript**, and **vanilla CSS** (no Tailwind). It provides:
- An interactive dashboard where notes, tasks and AI‑generated insights are visualised as *cards*.
- A **Second‑Brain Chat** that talks to the Lemma LLM, cites sources, and can ingest uploaded PDFs.
- A **Knowledge‑Graph** visualisation with a *dotted‑grid* background for a sleek dark‑/light‑mode experience.
- A **collapsible left‑hand sidebar** for tasks/insights.
- Robust **authentication fallback** and **token handling** for Lemma API calls.
- Full **unit‑test** coverage for API routes and UI components.

The project lives under `c:\Users\balab\OneDrive\Desktop\Works\AI-Second-Brain`.

---

## Core Functionalities
### 1️⃣ StreamBrain Dashboard
- **Cards**: Represent *thoughts*, *tasks*, *documents*.
- **Juggling**: Drag‑and‑drop re‑ordering; merging two cards creates a summarized card.
- **Search**: Full‑text search across all stored thoughts.
- **Export**: Export selected cards as JSON.

### 2️⃣ Second‑Brain Chat
- Messaging UI with **light‑mode surface‑raised cards**.
- Each response includes **citations** (knowledge source, idea, task, etc.).
- Supports **streamed LLM replies**, auto‑scroll, and copy‑to‑clipboard.
- Ability to *continue a conversation* after page reload (state persisted in `localStorage`).

### 3️⃣ Knowledge Graph
- SVG‑based graph visualising relationships between thoughts, tasks, and documents.
- Background is a **dotted grid** (SVG `<pattern>` with circles every 28 px).
- Syncs the **theme** (light/dark) with the rest of the site.
- Nodes are clickable – clicking opens the corresponding card in the dashboard.

### 4️⃣ File Upload & PDF Processing
- **Upload component** (`src/app/api/upload/route.ts`) accepts PDFs, images, txt.
- **Lemma SDK** uploads file to `/documents` folder, extracts markdown/text.
- Content is **classified** via `streambrain‑classifier` prompt into a JSON `Thought`.
- Result stored in Lemma `thoughts` and `documents` tables.
- Handles **502/401** errors with graceful fallback and logs the CLI token.

### 5️⃣ Task & Insight Sidebar
- Collapsible **left‑hand panel** that shows:
  - Pending tasks (`tasks.json` under `streambrain/tables/tasks`).
  - AI‑generated insights (e.g., “You should read this article”).
- Toggle button persists open/closed state in `sessionStorage`.

### 6️⃣ Theme & UI Consistency
- Global CSS variables for **primary**, **surface**, **border**, **radius**.
- All components respect `prefers-color-scheme` and a manual **theme switch**.
- Dark mode uses subtle **glass‑morphism** and vibrant gradients.
- Light mode uses calm pastel accents.

### 7️⃣ API & Authentication Layer
- Centralised Lemma client (`src/lib/lemma.ts`).
- **Token fallback**: Tries `lemma auth print-token`; if that fails, reads `LEMMA_API_TOKEN` env var.
- Early **401 handling** returns a JSON error with clear message.
- All API routes (`/api/*`) are wrapped with `withErrorHandler` for consistent responses.

### 8️⃣ Data Persistence
- Primary storage is the **Lemma SDK** (remote) for thoughts & documents.
- Local tasks are stored in **SQLite** (`tasks.json` is synced to DB via a tiny wrapper).
- Client‑side caches use **React Query** for stale‑while‑revalidate.

---

## How to Verify / Demo Each Feature
Below is a step‑by‑step checklist you can run locally. Screenshots are provided in the `artifacts/` folder (referenced by links).

### 1️⃣ Verify Dashboard UI
1. Run `npm run dev` (see *Running Locally* section).
2. Open `http://localhost:3000/`.
3. Observe the **card layout** – cards should have rounded corners, drop‑shadows, and a light surface.
4. Drag a card onto another – a modal appears asking to *Merge*; after confirming, a new *summary* card is created.
5. Click the **search bar**, type a keyword (e.g., “meeting”), and confirm filtered results.

> **Screenshot**: ![Dashboard](file:///C:/Users/balab/.gemini/antigravity-ide/brain/96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca/media_96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca_1782473610296.png)

### 2️⃣ Verify Second‑Brain Chat
1. Click the **Chat** tab on the top navigation.
2. Type `Explain the concept of embeddings.` and press **Enter**.
3. The response should appear in a light‑mode card with **citation numbers** like `[1]` linking to the source.
4. Hover a citation – a tooltip shows the source title and URL.
5. Reload the page – the chat history persists.

> **Screenshot**: ![Chat UI](file:///C:/Users/balab/.gemini/antigravity-ide/brain/96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca/media_96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca_1782473865306.png)

### 3️⃣ Verify Knowledge Graph
1. Navigate to **Knowledge Graph** via the side menu.
2. Confirm the **dotted‑grid** background (small circles spaced evenly).
3. Click on any node – a tooltip shows the thought title; clicking opens the card.
4. Toggle the **Theme Switch** – the graph background updates to a matching light/dark variant.

> **Screenshot**: ![Graph Light](file:///C:/Users/balab/.gemini/antigravity-ide/brain/96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca/media_96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca_1782540019828.png)

### 4️⃣ Verify File Upload & PDF Processing
1. In the dashboard, click the **Upload** button (top‑right).
2. Select a PDF (e.g., `sample.pdf`).
3. A spinner appears; after ~2 seconds the card list shows a new **Thought** titled “<PDF‑title>”.
4. Open the card – the extracted text should be present; click **Classify** to see AI‑generated categories.
5. Inspect the network tab – a `POST /api/upload` returns **200** with JSON containing `thoughtId`.
6. To test error handling, temporarily remove `LEMMA_API_TOKEN` from `.env.local` and retry upload – you should see a console error **File upload failed “File upload processing failed”** and a UI toast with the same message.

> **Screenshot**: ![Upload Error](file:///C:/Users/balab/.gemini/antigravity-ide/brain/96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca/media_96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca_1782540744940.png)

### 5️⃣ Verify Task & Insight Sidebar
1. Click the **hamburger** icon on the left edge – the sidebar slides out.
2. Under **Tasks**, you should see items from `streambrain/tables/tasks/tasks.json` (e.g., “Review quarterly report”).
3. Click a task – the main view scrolls to the linked card.
4. Add a new task via the **+** button; confirm it persists after page reload.

> **Screenshot**: ![Sidebar](file:///C:/Users/balab/.gemini/antigravity-ide/brain/96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca/media_96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca_1782540724958.png)

### 6️⃣ Verify Theme Sync
1. Open **Settings** → **Theme** and toggle between *Light* and *Dark*.
2. Confirm **all** components (Dashboard, Chat, Graph, Sidebar) change instantly and share the same palette.
3. Verify that the **navbar** background matches the rest of the page (no stray dark sections).

> **Screenshot**: ![Theme Switch](file:///C:/Users/balab/.gemini/antigravity-ide/brain/96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca/media_96c6c2e8-49f1-4c4b-bdab-fd9a222f03ca_1782535953690.png)

### 7️⃣ Verify API Authentication Fallback
1. Open a terminal in the project root.
2. Run `node -e "require('./src/lib/lemma').testToken()"` (a helper script you can add) – it should log the token used.
3. Temporarily rename the Lemma CLI binary or break the `lemma auth print-token` command, then restart the dev server.
4. The server should log *“CLI token not available, using env token”* and continue to work (provided `LEMMA_API_TOKEN` is set).
5. Remove the env var as well – API calls now return **401** and the UI shows a **toast** with *“Authentication failed – please set LEMMA_API_TOKEN or login via Lemma CLI.”*

---

## Running the Project Locally
```bash
# Clone (if not already present)
git clone https://github.com/yourorg/AI-Second-Brain.git
cd AI-Second-Brain

# Install dependencies (uses npm)
npm install

# Create a .env.local (copy from .env.example) and set:
#   LEMMA_API_URL=http://127.0.0.1:8711
#   LEMMA_API_TOKEN=your‑lemma‑token
#   NEXT_PUBLIC_THEME=light   # or dark

# Start dev server
npm run dev   # runs on http://localhost:3000
```
Visit `http://localhost:3000` and follow the verification steps above.

---

## Build & Deployment Notes
- **Production build**: `npm run build && npm start` (uses Next.js server‑side rendering).
- **Dockerfile** is included for containerised deployment; ensure the Lemma SDK socket is mounted if running inside Docker.
- **CI** runs unit tests (`npm test`) and a lint step (`npm run lint`).

---

## Future Enhancements (Roadmap)
| Priority | Feature | Description |
|---|---|---|
| 🚀 | **Offline mode** | Cache thoughts locally with IndexedDB and sync when online. |
| 🎨 | **Customizable Themes** | Allow users to upload their own gradient/color palettes. |
| 📊 | **Analytics Dashboard** | Show stats on number of thoughts, PDF uploads, AI token usage. |
| 🔗 | **Knowledge‑Graph Edge Types** | Visual distinction between *task‑related* and *document‑related* edges. |
| 🗂️ | **Bulk Import/Export** | CSV/JSON bulk import of tasks and thoughts. |

---

*This documentation was generated on 2026‑06‑27 by Antigravity, the AI‑powered coding assistant.*
