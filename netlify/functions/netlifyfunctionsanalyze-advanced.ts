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
请基于以下简历和JD，用简体中文输出 JSON，包含：
1. jobAnalysis：岗位深度分析
2. careerAssessment：职业测评
3. metaphysicalAnalysis：如果能从简历中找到生日，再做星座/八字分析；找不到就说明 birthdayFound=false

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
            jobAnalysis: { type: Type.OBJECT },
            careerAssessment: { type: Type.OBJECT },
            metaphysicalAnalysis: { type: Type.OBJECT },
          },
          required: ['jobAnalysis', 'careerAssessment', 'metaphysicalAnalysis'],
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