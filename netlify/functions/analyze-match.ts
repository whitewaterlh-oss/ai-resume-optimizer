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

    const { resumeText, jobText } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
你是一位专业简历顾问。请根据候选人简历和岗位JD，用简体中文输出 JSON，包含：
1. matchScore：0-100
2. analysis：简短分析
3. deficiencies：差距列表
4. suggestions：建议列表

简历：
"""${resumeText || ''}"""

JD：
"""${jobText || ''}"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            deficiencies: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['matchScore', 'analysis', 'deficiencies', 'suggestions'],
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