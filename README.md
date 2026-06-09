# AutoCV — AI Resume Enhancer

Paste your resume (or upload a PDF). AutoCV parses it, rewrites bullet points with strong action verbs, crafts a professional summary, and renders it as a clean, editable resume template. Optionally paste a job description to tailor the output to a specific role.

## Features

- **Paste or upload** — accepts raw text or PDF
- **AI enhancement** — rewrites bullets, generates a summary, quantifies impact
- **JD tailoring** — paste a job description to align keywords and tone
- **Live editable template** — click any field to adjust after generation
- **Download as PDF** — browser print-to-PDF, zero dependencies
- **Copy as plain text** — one-click copy for quick pasting elsewhere

## Stack

- **Backend**: Node.js + Express
- **AI**: Google Gemini 1.5 Flash (free tier via Google AI Studio)
- **Frontend**: Vanilla HTML/CSS/JS

## Setup

```bash
git clone https://github.com/CopperRoger/AutoCV.git
cd AutoCV
npm install
cp .env.example .env
# Add your Gemini API key to .env
npm start
```

Open [http://localhost:5000](http://localhost:5000)

### Get a free Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key**
3. Paste it into your `.env` as `GEMINI_API_KEY=...`

## Project Structure

```
AutoCV/
├── app.js              # Express server
├── routes/
│   └── generate.js     # AI processing route (text + PDF)
├── frontend/
│   ├── index.html      # UI
│   ├── style.css       # Styling
│   └── script.js       # Client logic + resume renderer
├── .env.example
└── README.md
```
