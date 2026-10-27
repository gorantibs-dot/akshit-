import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/generate", async (req, res) => {
  const { chapter, subject = "Auto-detect", exam = "JEE Main + Advanced", language = "Hindi + English" } = req.body || {};
  if (!chapter || typeof chapter !== "string" || chapter.trim().length < 2) {
    return res.status(400).json({ error: "Please enter a chapter name." });
  }
  if (chapter.length > 120) return res.status(400).json({ error: "Chapter name is too long." });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "The AI service is not configured yet. Add OPENAI_API_KEY in your server environment." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
You are an accurate JEE preparation tutor. Create a useful, exam-focused study pack for:
Chapter: ${chapter.trim()}
Subject: ${subject}
Exam target: ${exam}
Language: ${language}

Use web search to research reliable sources, preferring official NTA/JEE documents, NCERT, and reputable educational references. Keep the response in clear Markdown with these exact sections:
# Chapter at a glance
# Short notes
# Formula sheet (or key facts if not formula-based)
# Mind map
Use a readable text tree with branches and sub-branches; do not claim to create a graphic.
# Tricks and common traps
Give legitimate time-saving methods, conditions where each method works, and common mistakes.
# Solved tricky questions
Give 3 original exam-style questions with step-by-step solutions and explain the trick.
# Previous-year questions (PYQs)
Include only questions you can responsibly identify as actual past questions with year/exam and a source link or citation. If you cannot verify exact official wording/source, clearly say so and provide a separate subsection called "PYQ-style practice (not verified official PYQs)" instead. Never invent a year or label a generated question as a real PYQ.
# Quick practice
Give 5 multiple-choice questions, options A-D, answers and concise explanations. Put answers after all questions.
# 20-minute revision plan
# Sources
List the important sources used with clickable URLs where available.

Keep notes concise but sufficiently complete for JEE Main and Advanced. Preserve correct notation, units, assumptions, and edge cases. If bilingual, explain key concepts in both Hindi and English without duplicating every long paragraph. Be honest about uncertainty and conflicting sources. Do not reproduce long copyrighted passages; summarize in your own words.
`;
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      tools: [{ type: "web_search" }],
      tool_choice: "required",
      input: prompt
    });
    res.json({ content: response.output_text || "No study material was returned." });
  } catch (err) {
    console.error("Generation error:", err?.message || err);
    res.status(500).json({ error: "Could not generate notes right now. Check your API key, model access, and API billing, then try again." });
  }
});

app.listen(port, () => console.log(`JEE Smart Notes AI running on port ${port}`));
