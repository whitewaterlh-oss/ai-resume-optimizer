import { GoogleGenAI, Type, Part } from '@google/genai';
import { ResumeAnalysisResult, FileData } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing VITE_GEMINI_API_KEY');
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function analyzeResume(
  resumeText: string,
  resumeFile: FileData | null,
  jobText: string,
  jobImages: FileData[],
  retries = 3
): Promise<ResumeAnalysisResult> {
  const parts: Part[] = [];

  parts.push({ text: "You are an expert career coach and resume writer." });

  if (resumeFile) {
    parts.push({ text: "Here is the user's current resume (PDF):" });
    parts.push({
      inlineData: {
        data: resumeFile.base64,
        mimeType: resumeFile.mimeType
      }
    });
  } else if (resumeText) {
    parts.push({ text: `Here is the user's current resume:\n"""${resumeText}"""` });
  }

  parts.push({ text: "Here is the target job description and requirements:" });
  if (jobText) {
    parts.push({ text: `"""${jobText}"""` });
  }

  for (const img of jobImages) {
    parts.push({
      inlineData: {
        data: img.base64,
        mimeType: img.mimeType
      }
    });
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
   - Step 2: Restore Real Work Content. De-glorify the JD to show the actual day-to-day (e.g., "cross-functional coordination" = arguing/pushing progress).
   - Step 3: Deep Dive into Talent Persona. Uncover hidden hiring criteria not explicitly stated but cared about by HR/Business teams.
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
   
IMPORTANT: All your responses, including the analysis, suggestions, and the optimized resume, MUST be written in Simplified Chinese (简体中文).`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER, description: 'Match score from 0 to 100' },
            analysis: { type: Type.STRING, description: 'Brief analysis of the fit' },
            deficiencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills gap analysis and deficiencies'
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable suggestions for improvement'
            },
            optimizedResume: { type: Type.STRING, description: 'Optimized resume in Markdown format' },
            jobAnalysis: {
              type: Type.OBJECT,
              description: "Deep analysis of the Job Description (JD).",
              properties: {
                positioning: { type: Type.STRING, description: "Analysis of the role's business position and likely reason for hiring." },
                realWorkContent: { type: Type.ARRAY, items: { type: Type.STRING }, description: "De-glorified, realistic daily tasks and challenges." },
                hiddenTalentPersona: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hidden hiring criteria and unspoken expectations." }
              }
            },
            careerAssessment: {
              type: Type.OBJECT,
              description: "Career assessment test identifying strengths, weaknesses, suitable roles, and test questions.",
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "User's core strengths" },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "User's weaknesses or areas for improvement" },
                suitableRoles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Alternative or highly suitable job positions" },
                testQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Targeted interview/test questions to verify capabilities" }
              }
            },
            metaphysicalAnalysis: {
              type: Type.OBJECT,
              description: "Astrological and Bazi analysis based on the candidate's birthday (if found in the resume).",
              properties: {
                birthdayFound: { type: Type.BOOLEAN, description: "True if a birthday was found in the resume." },
                zodiac: { type: Type.STRING, description: "The candidate's Zodiac sign." },
                bazi: { type: Type.STRING, description: "A brief summary of the candidate's Bazi (Four Pillars of Destiny)." },
                suitableRoles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Job roles suitable for their astrological profile." },
                auspiciousDirections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Auspicious geographical directions or countries." },
                guidance: { type: Type.STRING, description: "Comprehensive guidance based on this metaphysical analysis." }
              }
            }
          },
          required: ['matchScore', 'analysis', 'deficiencies', 'suggestions', 'optimizedResume', 'jobAnalysis', 'careerAssessment', 'metaphysicalAnalysis']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Failed to generate analysis');
    }

    return JSON.parse(text);
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`API call failed, retrying... (${retries} retries left)`, error);
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return analyzeResume(resumeText, resumeFile, jobText, jobImages, retries - 1);
    }
    throw error;
  }
}
