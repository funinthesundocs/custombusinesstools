# AI ASSISTANT MODAL — Paste into Claude Code

## WHAT TO BUILD

Add an AI Assistant button to the NavBar that opens a slide-in chat panel from the right side of the screen. The chat panel connects to the same RAG-powered agent already working on the internal dashboard — same Supabase embeddings, same conversation history, same voice.

## BEFORE YOU START — READ THESE FILES

1. `web/dashboard/src/app/agent/page.tsx` — the working agent chat implementation (copy the chat logic)
2. `web/dashboard/src/app/api/chat/route.ts` — the API route that handles RAG retrieval + Anthropic API call (copy and adapt)
3. `web/dashboard/src/app/api/tts/route.ts` — the ElevenLabs TTS route (copy)
4. `web/dashboard/.env.local` — API keys (Supabase, Anthropic, OpenAI, ElevenLabs)
5. `web/presentation/.env.local` — confirm these same keys are present here. If not, copy them.

## ARCHITECTURE — 6 FILES TO CREATE/MODIFY

### 1. `src/components/AIChat.tsx` — Shared chat component

Extract the core chat logic into a reusable component. This component handles:
- Fetching conversation history from Supabase `external_agent_conversations` table on mount
- Displaying messages in a scrollable container (user messages right-aligned, assistant messages left-aligned with gold left border)
- Input bar at bottom with send button
- Voice toggle button (microphone icon from Lucide)
- When user sends a message:
  a. Insert into `external_agent_conversations` with role 'user' immediately
  b. Call the chat API route which: embeds the question via OpenAI, runs similarity search against `intelligence_documents` in Supabase (threshold 0.5, match_count 10), assembles system prompt with retrieved context, calls Anthropic API with claude-sonnet-4-20250514
  c. Stream the response back. On completion, insert into `external_agent_conversations` with role 'assistant'
- Auto-scroll to bottom on new messages
- Show relative timestamps on messages ("2 min ago", "Yesterday 4:32 PM")
- Show a subtle loading spinner/skeleton while conversation history is fetching on first open
- Show a typing indicator (three animated dots) while waiting for the assistant's response
- Include last 10 messages as conversation context in API calls for continuity

System prompt for the external agent:
"You represent Genluiching Mining Corporation. You answer questions about GMC's mining assets, geological data, and partnership opportunity with confidence and accuracy. You draw on verified data from nine independent laboratories, eight drill holes, geophysical surveys, and professionally filed geological reports. You do NOT speculate about deal terms, financial projections beyond what's in the presentation materials, or internal company matters. If asked about something outside your knowledge, say 'That's a great question — I'll make sure our team follows up with you directly.' You present geological evidence with the confidence of convergent data from independent sources."

Props interface:
```typescript
interface AIChatProps {
  className?: string;
  onClose?: () => void;  // optional close handler for modal mode
  showHeader?: boolean;   // true in modal (shows title + close button), false in full page
}
```

Design:
- Light theme matching the presentation site
- White background, clean borders
- User messages: subtle navy/gold background at low opacity, right-aligned
- Assistant messages: white card with thin gold left border, left-aligned
- Input bar: white background, border, gold send button
- Voice button: microphone icon, toggles recording state with visual indicator
- Typography: DM Sans for messages, JetBrains Mono for any data/numbers in responses

### 2. `src/components/AIAssistantModal.tsx` — Slide-in panel

```typescript
interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

Implementation:
- Fixed position overlay covering the full screen
- Semi-transparent dark backdrop (click to close)
- Panel slides in from the right: 420px wide on desktop, 100vw on mobile (< 768px)
- Smooth transition: transform translateX(100%) → translateX(0), 300ms ease-out
- Panel has white background, subtle left shadow
- Header inside panel: "AI Assistant" title (DM Sans 600) + close button (X icon from Lucide)
- Below header: render `<AIChat showHeader={false} onClose={onClose} />`
- Panel takes full viewport height
- Z-index above everything (z-50 or higher)
- Body scroll locked when modal is open (add overflow: hidden to document.body)
- Escape key closes the modal
- Animate out on close: translateX(0) → translateX(100%), then unmount

### 3. `src/contexts/AIAssistantContext.tsx` — State management

```typescript
'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

interface AIAssistantContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Standard React context provider
// Wrap the app layout with this provider
// The modal state persists across page navigation because it lives at the layout level
```

### 4. `src/app/api/chat/route.ts` — Chat API route

Copy the chat API logic from the dashboard. Adapt:
- Use the EXTERNAL system prompt (above), not the internal one
- Embed user question via OpenAI text-embedding-3-small
- Query Supabase `intelligence_documents` using the match_intelligence function
- Call Anthropic API with claude-sonnet-4-20250514
- Stream the response
- Include last 10 messages from `external_agent_conversations` as conversation history

### 5. `src/app/api/tts/route.ts` — TTS API route

Copy from dashboard. Use ElevenLabs with Titan voice:
- voice_id: T1PAJSQMHL7OFVB1KTOQ
- model_id: eleven_turbo_v2_5
- Return audio stream

### 6. Modify `src/components/NavBar.tsx` — Add the button

Add an "AI Assistant" button to the NavBar, positioned to the right of the last nav link:
- Desktop: Text button "AI Assistant" with a small sparkle or chat icon (from Lucide: MessageCircle or Sparkles)
- Styled differently from nav links — subtle gold background or gold border to make it stand out as a CTA
- On hover: slightly brighter gold
- Mobile: Just the icon (no text) to save space
- onClick: call the `open()` function from AIAssistantContext

Also modify `src/app/layout.tsx`:
- Wrap children with `<AIAssistantProvider>`
- Render `<AIAssistantModal />` at the layout level (outside page content, so it persists across navigation)

### 7. Modify existing `/advisor` page

Replace the current advisor page content with:
```tsx
<AIChat showHeader={true} />
```
This makes the full-page version use the same shared component. Both the modal and the full page now share identical chat logic and conversation history.

## SUPABASE TABLES

Verify these exist. If not, create them:

```sql
CREATE TABLE IF NOT EXISTS external_agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Visitor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE external_agent_conversations DISABLE ROW LEVEL SECURITY;

-- Verify intelligence_documents table exists with embeddings
-- Verify the match_intelligence function exists
```

## ENV VARIABLES NEEDED

Confirm all of these are in `web/presentation/.env.local`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
```
If any are missing, copy from `web/dashboard/.env.local`.

## OFFLINE BEHAVIOR

If `navigator.onLine === false`:
- The NavBar button still shows but with reduced opacity
- Clicking it opens the modal with a centered message: "AI Assistant requires an internet connection. Please connect to use this feature."
- No API calls attempted
- When connection restores, the full chat loads automatically (listen for the `online` event)

## TESTING

After building:
1. Click "AI Assistant" in the nav — modal should slide in from the right
2. The existing conversation history from `external_agent_conversations` should load immediately
3. Send a new message — it should get a RAG-powered response
4. Close the modal, navigate to /assets, reopen — history should still be there with the message you just sent
5. Test voice — click mic, speak, verify Titan voice responds
6. Test Escape key closes the modal
7. Test clicking the dark backdrop closes the modal
8. Test mobile viewport — modal should be full-width
9. Visit /advisor — should show the same chat in full-page mode with the same conversation history
10. Disconnect network — button should show reduced state, modal should show offline message

Build all of this now. Report when complete.
