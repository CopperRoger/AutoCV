const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    const prompt = `
You are a professional resume and cover letter writer. Given:

Resume:
${resume}

Job Description:
${jobDescription}

Return a JSON with:
1. 3 improved, *concise*, and *impactful* resume bullet points tailored to the job. Each bullet ≤ 2 lines. Avoid filler like “showcasing” or “demonstrating”. Use strong action verbs.

2. A short, personal cover letter (≤ 150 words). Avoid generic phrases like "I am writing to express...". Instead, sound authentic and motivated. Don’t repeat the resume bullets verbatim.

Output format:
{
  "bullets": ["...", "...", "..."],
  "coverLetter": "..."
}
`;


    const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // switch from pro to flash
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});



console.log("Calling Gemini with prompt...");
const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gemini API error' });
  }
});

module.exports = router;
