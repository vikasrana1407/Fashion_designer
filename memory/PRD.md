# Atelier Noir — AI Fashion Design Studio · PRD

## Original Problem Statement
Build an AI-powered fashion design web app. Users upload reference media (jackets, fabrics, sketches, logos) + a text prompt; AI generates new fashion concepts and style variations (color/pattern/material). Use Python + Django.

## User Choices (captured Feb 2026)
- Backend: **Strict Django** (served via uvicorn ASGI from `server:app`)
- AI Model: **Gemini Nano Banana** (`gemini-3.1-flash-image-preview`) via `emergentintegrations` + Emergent Universal Key
- Auth: **JWT email/password**
- Core features for v1: prompt+reference generation, style variations, gallery/history, mood boards, outfit composer
- Aesthetic: **Editorial high-fashion** — dark, brutalist, Cormorant Garamond serif + Outfit sans

## Architecture
- **Backend**: Django 5 ASGI on port 8001 (uvicorn). `pymongo` directly for MongoDB. `emergentintegrations` for Nano Banana. JWT via `PyJWT`, bcrypt for passwords.
- **Frontend**: React 19 + React Router + Tailwind + sonner toasts + lucide-react icons. Auth context with bearer token in localStorage.
- **MongoDB collections**: `users`, `designs`, `collections`, `outfits` — base64 data-URI images stored inline.

## Implemented (v1 — Feb 2026)
- ✅ Landing page (editorial Tetris-grid hero + workflow + concept gallery)
- ✅ JWT auth (register / login / me) with bcrypt
- ✅ Studio: prompt + optional reference image upload + style/color/material/audience chips → Nano Banana render
- ✅ Gallery (vault) with detail modal, delete, add-to-board
- ✅ Mood boards (collections): create, list, detail, add/remove items
- ✅ Outfit composer: pick multiple designs, name and save as outfit
- ✅ Protected routes; logout
- ✅ 28/28 backend tests passing

## User Personas
- **Fashion designer**: rapid concept iteration before sketching production patterns
- **Stylist / creative director**: build mood boards & outfit references for shoots
- **Brand founder**: explore aesthetic directions for upcoming drops

## Backlog (P0 / P1 / P2)
- P0: Variations endpoint (generate N siblings from a prior design, keep silhouette, vary palette/material)
- P0: Public share links for designs / boards (read-only token)
- P1: PDF moodboard export
- P1: Image-to-image strength slider
- P1: Tagging + search filters in gallery
- P2: Team workspaces (multi-user boards)
- P2: Stripe-gated unlimited generations + credit packs
- P2: Object storage migration (move base64 → S3/Cloudflare R2 for scale)
- P2: Lookbook builder (multi-page outfit story PDFs)

## Next Tasks
1. Variations / "remix this concept" endpoint
2. Share link tokens
3. Tag-based filtering in gallery
