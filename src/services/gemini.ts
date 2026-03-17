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
  matchScore: basic?.matchScore ?? 0,
  analysis: basic?.analysis ?? '',
  deficiencies: Array.isArray(basic?.deficiencies) ? basic.deficiencies : [],
  suggestions: Array.isArray(basic?.suggestions) ? basic.suggestions : [],
  optimizedResume: resume?.optimizedResume ?? '',

  jobAnalysis: {
    positioning: advanced?.jobAnalysis?.positioning ?? '',
    realWorkContent: Array.isArray(advanced?.jobAnalysis?.realWorkContent)
      ? advanced.jobAnalysis.realWorkContent
      : [],
    hiddenTalentPersona: Array.isArray(advanced?.jobAnalysis?.hiddenTalentPersona)
      ? advanced.jobAnalysis.hiddenTalentPersona
      : [],
  },

  careerAssessment: {
    strengths: Array.isArray(advanced?.careerAssessment?.strengths)
      ? advanced.careerAssessment.strengths
      : [],
    weaknesses: Array.isArray(advanced?.careerAssessment?.weaknesses)
      ? advanced.careerAssessment.weaknesses
      : [],
    suitableRoles: Array.isArray(advanced?.careerAssessment?.suitableRoles)
      ? advanced.careerAssessment.suitableRoles
      : [],
    testQuestions: Array.isArray(advanced?.careerAssessment?.testQuestions)
      ? advanced.careerAssessment.testQuestions
      : [],
  },

  metaphysicalAnalysis: {
    birthdayFound: advanced?.metaphysicalAnalysis?.birthdayFound ?? false,
    zodiac: advanced?.metaphysicalAnalysis?.zodiac ?? '',
    bazi: advanced?.metaphysicalAnalysis?.bazi ?? '',
    suitableRoles: Array.isArray(advanced?.metaphysicalAnalysis?.suitableRoles)
      ? advanced.metaphysicalAnalysis.suitableRoles
      : [],
    auspiciousDirections: Array.isArray(advanced?.metaphysicalAnalysis?.auspiciousDirections)
      ? advanced.metaphysicalAnalysis.auspiciousDirections
      : [],
    guidance: advanced?.metaphysicalAnalysis?.guidance ?? '',
  },
};
