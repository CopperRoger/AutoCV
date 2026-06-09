const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /generate
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';

    if (req.file) {
      const parsed = await pdfParse(req.file.buffer);
      resumeText = parsed.text;
    } else {
      resumeText = req.body.resumeText || '';
    }

    const jobDescription = req.body.jobDescription || '';

    if (!resumeText.trim()) {
      return res.status(400).json({ error: 'No resume text provided.' });
    }

    const prompt = buildPrompt(resumeText, jobDescription);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonStr = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const parsed = JSON.parse(jsonStr);

    res.json({ result: parsed });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ error: 'Failed to process resume. ' + err.message });
  }
});

function buildPrompt(resumeText, jobDescription) {
  const jdSection = jobDescription.trim()
    ? `\nJob Description (tailor the resume toward this role):\n${jobDescription}`
    : '\n(No job description provided — enhance the resume generally.)';

  return `You are an expert resume writer. Your job is to:
1. Parse the provided resume into structured sections.
2. Enhance it — rewrite bullet points to be concise and impactful using strong action verbs, quantify achievements where possible, and write a polished professional summary.
${jobDescription.trim() ? '3. Tailor the content to match the job description keywords and requirements.' : ''}

Resume:
${resumeText}
${jdSection}

Return ONLY a valid JSON object with this exact structure:

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "linkedin": "LinkedIn URL or empty string",
  "github": "GitHub URL or empty string",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Month Year – Month Year",
      "bullets": ["bullet 1", "bullet 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "Tech stack used",
      "githubLink": "GitHub URL for this project or empty string",
      "liveLink": "Live demo URL or empty string",
      "bullets": ["bullet 1", "bullet 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree and Major",
      "duration": "Year – Year",
      "details": "GPA, honors, or relevant coursework"
    }
  ],
  "achievements": [
    {
      "title": "Achievement title",
      "detail": "Score, rank, or short description"
    }
  ],
  "certifications": ["cert1", "cert2"]
}

Rules:
- Keep bullets to 1 line each, starting with a past-tense action verb.
- Quantify impact wherever the original data allows (%, numbers, scale).
- If a field is missing from the resume, use an empty string or empty array.
- For achievements: include competitive programming ratings, rankings, hackathon wins, awards — anything notable that does not fit experience or projects.
- Preserve ALL URLs exactly as they appear in the resume. Do not modify or drop any links.
- Do NOT invent information. Only enhance what is already there.
- Return valid JSON only. No markdown fences, no explanation text.`;
}

module.exports = router;