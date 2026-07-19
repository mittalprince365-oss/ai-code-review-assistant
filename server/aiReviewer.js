const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function aiReview(code, language, staticIssues) {
  const prompt = `You are an expert code reviewer. Review this ${language} code.

Static analysis (ESLint) already found these issues:
${JSON.stringify(staticIssues, null, 2)}

Code to review:
\`\`\`${language}
${code}
\`\`\`

Respond with ONLY a valid JSON object, no markdown, no backticks, no extra text.
Use exactly this structure:
{
  "summary": "2-3 sentence overall review of the code",
  "complexity": "low" or "medium" or "high",
  "issues": [
    {
      "line": <line number or null>,
      "severity": "high" or "medium" or "low",
      "type": "bug" or "code-smell" or "performance" or "naming" or "best-practice",
      "description": "what is wrong",
      "suggestion": "how to fix it"
    }
  ],
  "improved_code": "the full corrected version of the code as a string"
}

Rules:
- Find bugs that static analysis missed (logic errors, crashes, edge cases)
- Suggest better variable/function names where needed
- Keep descriptions short and clear
- improved_code must be complete, working code`;

  const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });

  let text = response.text;

  // AI kabhi kabhi ```json ... ``` laga deta hai - usko saaf karo
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('AI JSON parse failed:', e.message);
    return {
      summary: 'AI review could not be parsed. Raw response saved.',
      complexity: 'unknown',
      issues: [],
      improved_code: null,
      raw: text.slice(0, 500),
    };
  }
}

module.exports = { aiReview };