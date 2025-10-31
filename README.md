# 🎯 AI Ticket Prioritizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Streamline your workflow — let AI automatically rank, categorize, and help your team focus on the tickets that matter most.**

---

## ✨ Overview

Transform support ops with AI‐powered analysis of ticket urgency, technical impact, and business priority.  
Seamlessly classify, score, and export actionable, ranked results for any CSV ticket set.

---

## 🚀 Features

- **AI‑Driven Smart Prioritization:**  
  Deep ranking by *urgency*, *severity*, and custom priority scores.
- **Automated Categorization & Tagging:**  
  Instantly group tickets with intelligent categories and 1‑3 relevant tags.
- **Effortless CSV Workflow:**  
  Upload, analyze, filter, and export — at any scale.
- **Blazing Performance:**  
  Chunked batch API calls handle thousands of tickets in parallel.
- **Security by Design:**  
  Your API key is *never* exposed to browsers — protected by Netlify serverless.

---

## 📋 Prerequisites

- **Node.js** (v18+)
- **Google Gemini API key**
- **CSV file** of tickets

---

## 🛠️ Installation & Setup

```
git clone https://github.com/kova-css/ai-ticket-prioritizer.git
cd ai-ticket-prioritizer
npm install
```

**Local .env setup:**  
Create a `.env` file at project root:

```
GEMINI_API_KEY=your_api_key_here
```

> **Netlify Deploy:**  
Set `GEMINI_API_KEY` in Netlify’s *environment variables* — never commit `.env`!

---

## ⚙️ Configuration

- **Modes:** Standard and Expert (custom weights, context, and categorization)
- **Formula:** `(urgency * urgencyWeight) + (severity * severityWeight)`
- **Netlify Functions:**  
  Function API at `/.netlify/functions/analyze` (handles all Gemini API logic/server-side secrets)
- **Sample CSV Format:**
    ```
    id,summary,description,reporter
    1,UI alignment issue,...,Alice
    ```

---

## 📖 Usage

```
npm run dev # Frontend only (development)
npx netlify dev # Full stack (local functions + frontend)
npm run build # Build for production
npm run preview # Serve build locally
```

- **Upload or sample:** Add your CSV.
- **Tune:** Switch mode, change weights, toggle category/tag generation.
- **Analyze:** Get ranked, categorized, and filterable results in-app.
- **Export:** Download prioritized CSV for immediate team use.

---

## 🌐 Netlify Deployment

1. **Connect repo** to Netlify.
2. **Set `GEMINI_API_KEY`** in site environment variables (UI, CLI, or API).
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`
5. AI requests run securely at `/.netlify/functions/analyze`.

---

## 🛡 Security

- API key stored **server‑side** only (read via serverless functions)
- No secret ever in browser bundles or repo!
- Never commit `.env` or sensitive keys.

---

## 🧩 Key Scripts

| Script           | Purpose                          |
|:-----------------|:---------------------------------|
| `npm run dev`    | Local frontend (Vite)            |
| `npx netlify dev`| Full local dev (functions)       |
| `npm run build`  | Build production assets          |
| `npm run preview`| Preview built app locally        |

---

## 📂 Contributing

- **Ideas?** Open an issue!
- **Bugs?** File an issue with error details and demo CSV if possible.
- **PRs:** Please describe changes, include test or demo steps.

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

## 📬 Support

*Questions or feedback?*  
File an issue in GitHub — we’ll answer fast!

---
