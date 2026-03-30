# Wanderlust — Travel Passport App

## What It Does
Users upload photos of their passport stamps. AI reads the stamps (country, date).
An interactive globe shows everywhere they've been. Timeline view of their travels.

## Architecture
- Next.js 15 + TypeScript
- Supabase for storage (passport images) + database (trips)
- Google Gemini for passport stamp OCR
- Interactive globe using CSS/SVG (no heavy 3D libraries)

## Agent Assignments
- **CLARK** (branch: clark/backend): Supabase tables, API routes, passport OCR via Gemini
- **REINA** (branch: reina/frontend): Globe visualization, timeline, upload UI, design
- **PINKY** (branch: pinky/content): Landing page copy, about page, SEO, social sharing

## Coordination
- Each agent works on their OWN branch
- When done, push branch and notify Claude God via A2A
- Claude God reviews, resolves conflicts, merges to main
- Deploy to Vercel

## Git Workflow
- Branch from main
- Commit with descriptive messages
- Push to origin
- DO NOT merge to main yourself
