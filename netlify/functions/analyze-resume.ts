import { GoogleGenAI, Type, Part } from '@google/genai';

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
      return new Response(
        JSON.stringify({ error: 'Missing GEMINI_API_KEY on server' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const { resumeText, resumeFile, jobText, jobImages } = await req.json();

    const parts: Part[] = [];

    parts.push({ text: 'You are an expert career coach and resume writer.' });

    if (resumeFile) {
      parts.push({ text: "Here is the user's current resume (PDF):" });
      parts.push({
        inlineData: {
          data: resumeFile.base64,
          mimeType: resumeFile.mimeType,
        },
      });
    } else if (resumeText) {
      parts.push({
        text: `Here is the user's current resume:\n"""${resumeText}"""`,
      });
    }

    parts.push({ text: 'Here is the target job description and requirements:' });

    if (jobText) {
      parts.push({ text: `"""${jobText}"""` });
    }

    if (Array.isArray(jobImages)) {
      for (const img of jobImages) {
        parts.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType,
          },
        });
      }
    }

    parts.push({
      text: `Please analyze the resume against the job requirements. Provide:
1. A match score (0-100) indicating how well the resume fits the job.
2. A brief analysis of the fit (strengths and gaps).
3. A test of deficiencies (skills gap analysis) for the individual relative to the job. What are they missing?
4. Specific, actionable suggestions for improvement.
5. An optimized version of the resume tailored to this job (in Markdown format).
6. A deep analysis of the Job Description (JD) itself, based on these three principles:
   - Step 1: Analyze Job Positioning. What is the role's position in the business? Why are they hiring now (replacement, expansion, odd-job)? Is it a good company/role?
   - Step 2: Restore Real Work Content. De-glorify the JD to show the actual day-to-day.
   - Step 3: Deep Dive into Talent Persona. Uncover hidden hiring criteria not explicitly stated.
7. A comprehensive Career Assessment Test based on the optimized profile. This must include:
   - The user's core strengths.
   - The user's weaknesses or areas for improvement.
   - A list of alternative or highly suitable job positions based on their skills.
   - 3-5 targeted interview/test questions to verify their actual capabilities.
8. Additionally, please look for the candidate's birthday in their resume. If found:
   - Determine their Western Zodiac sign.
   - Calculate a basic Bazi (Four Pillars of Destiny) reading.
   - Based on their Zodiac and Bazi, suggest suitable career paths/roles.
   - Suggest auspicious geographical directions or countries for their career development.
   - Provide a comprehensive multi-dimensional evaluation and guidance combining their professional skills and metaphysical profile.
   If no birthday is found, set birthdayFound to false.

IMPORTANT: All your responses, including the analysis, suggestions, and the optimized resume, MUST be written in Simplified Chinese (简体中文).`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: {
              type: Type.NUMBER,
              description: 'Match score from 0 to 100',
            },
            analysis: {
              type: Type.STRING,
              description: 'Brief analysis of the fit',
            },
            deficiencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills gap analysis and deficiencies',
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable suggestions for improvement',
            },
            optimizedResume: {
              type: Type.STRING,
              description: 'Optimized resume in Markdown format',
            },
            jobAnalysis: {
              type: Type.OBJECT,
              properties: {
                positioning: { type: Type.STRING },
                realWorkContent: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                hiddenTalentPersona: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
            careerAssessment: {
              type: Type.OBJECT,
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                weaknesses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suitableRoles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                testQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
            metaphysicalAnalysis: {
              type: Type.OBJECT,
              properties: {
                birthdayFound: { type: Type.BOOLEAN },
                zodiac: { type: Type.STRING },
                bazi: { type: Type.STRING },
                suitableRoles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                auspiciousDirections: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                guidance: { type: Type.STRING },
              },
            },
          },
          required: [
            'matchScore',
            'analysis',
            'deficiencies',
            'suggestions',
            'optimizedResume',
            'jobAnalysis',
            'careerAssessment',
            'metaphysicalAnalysis',
          ],
        },
      },
    });

    const text = response.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty model response' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Unknown server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};