import { ResumeAnalysisResult } from '../types';

async function postJSON(url: string, body: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || '请求失败');
  }

  return data;
}

export async function analyzeResume(
  resumeText: string,
  _resumeFile: any,
  jobText: string,
  _jobImages: any[]
): Promise<ResumeAnalysisResult> {
  const basic = await postJSON('/.netlify/functions/analyze-match', {
    resumeText,
    jobText,
  });

  const resume = await postJSON('/.netlify/functions/generate-resume', {
    resumeText,
    jobText,
    analysis: basic.analysis,
    deficiencies: basic.deficiencies,
    suggestions: basic.suggestions,
  });

  let advanced = {
    jobAnalysis: {},
    careerAssessment: {},
    metaphysicalAnalysis: {},
  };

  try {
    advanced = await postJSON('/.netlify/functions/analyze-advanced', {
      resumeText,
      jobText,
    });
  } catch (e) {
    console.warn('高级分析失败，跳过', e);
  }

  return {
    matchScore: basic.matchScore,
    analysis: basic.analysis,
    deficiencies: basic.deficiencies,
    suggestions: basic.suggestions,
    optimizedResume: resume.optimizedResume,
    jobAnalysis: advanced.jobAnalysis,
    careerAssessment: advanced.careerAssessment,
    metaphysicalAnalysis: advanced.metaphysicalAnalysis,
  };
}