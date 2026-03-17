import { GoogleGenAI, Type } from '@google/genai';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { resumeText, jobText, analysis, deficiencies, suggestions } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
请根据以下信息，用简体中文生成一版针对岗位优化后的简历（Markdown格式）。

原始简历：
"""${resumeText || ''}"""

目标JD：
"""${jobText || ''}"""

匹配分析：
${analysis || ''}

差距：
${Array.isArray(deficiencies) ? deficiencies.join('\n') : ''}

修改建议：
${Array.isArray(suggestions) ? suggestions.join('\n') : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedResume: { type: Type.STRING },
          },
          required: ['optimizedResume'],
        },
      },
    });

    return new Response(response.text || '{}', {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
