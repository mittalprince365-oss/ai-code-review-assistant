const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateDocs(code, language) {
  const prompt = `You are a technical documentation expert. Generate documentation for this ${language} code.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with ONLY a valid JSON object, no markdown, no backticks, no extra text.
Use exactly this structure:
{
  "overview": "2-3 sentence description of what this code does overall",
  "documented_code": "the full code with proper documentation comments added (JSDoc style for JavaScript, docstrings for Python). Keep the original code logic unchanged, only add documentation comments above each function/class."
}

Rules:
- Document every function and class: purpose, parameters with types, return value
- Do not change any code logic
- documented_code must be the complete code, ready to copy-paste`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });

  let text = response.text;
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('Docs JSON parse failed:', e.message);
    return {
      overview: 'Documentation could not be generated properly.',
      documented_code: null,
    };
  }
}

module.exports = { generateDocs };