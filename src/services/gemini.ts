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

  let advanced: any = {
    jobAnalysis: {
      positioning: '',
      realWorkContent: [],
      hiddenTalentPersona: [],
    },
    careerAssessment: {
      strengths: [],
      weaknesses: [],
      suitableRoles: [],
      testQuestions: [],
    },
    metaphysicalAnalysis: {
      birthdayFound: false,
      zodiac: '',
      bazi: '',
      suitableRoles: [],
      auspiciousDirections: [],
      guidance: '',
    },
  };

  try {
    const advancedResult = await postJSON('/.netlify/functions/analyze-advanced', {
      resumeText,
      jobText,
    });

    advanced = {
      jobAnalysis: {
        positioning: advancedResult?.jobAnalysis?.positioning ?? '',
        realWorkContent: Array.isArray(advancedResult?.jobAnalysis?.realWorkContent)
          ? advancedResult.jobAnalysis.realWorkContent
          : [],
        hiddenTalentPersona: Array.isArray(advancedResult?.jobAnalysis?.hiddenTalentPersona)
          ? advancedResult.jobAnalysis.hiddenTalentPersona
          : [],
      },
      careerAssessment: {
        strengths: Array.isArray(advancedResult?.careerAssessment?.strengths)
          ? advancedResult.careerAssessment.strengths
          : [],
        weaknesses: Array.isArray(advancedResult?.careerAssessment?.weaknesses)
          ? advancedResult.careerAssessment.weaknesses
          : [],
        suitableRoles: Array.isArray(advancedResult?.careerAssessment?.suitableRoles)
          ? advancedResult.careerAssessment.suitableRoles
          : [],
        testQuestions: Array.isArray(advancedResult?.careerAssessment?.testQuestions)
          ? advancedResult.careerAssessment.testQuestions
          : [],
      },
      metaphysicalAnalysis: {
        birthdayFound: advancedResult?.metaphysicalAnalysis?.birthdayFound ?? false,
        zodiac: advancedResult?.metaphysicalAnalysis?.zodiac ?? '',
        bazi: advancedResult?.metaphysicalAnalysis?.bazi ?? '',
        suitableRoles: Array.isArray(advancedResult?.metaphysicalAnalysis?.suitableRoles)
          ? advancedResult.metaphysicalAnalysis.suitableRoles
          : [],
        auspiciousDirections: Array.isArray(advancedResult?.metaphysicalAnalysis?.auspiciousDirections)
          ? advancedResult.metaphysicalAnalysis.auspiciousDirections
          : [],
        guidance: advancedResult?.metaphysicalAnalysis?.guidance ?? '',
      },
    };
  } catch (e) {
    console.warn('高级分析失败，跳过', e);
  }

  return {
    matchScore: basic?.matchScore ?? 0,
    analysis: basic?.analysis ?? '',
    deficiencies: Array.isArray(basic?.deficiencies) ? basic.deficiencies : [],
    suggestions: Array.isArray(basic?.suggestions) ? basic.suggestions : [],
    optimizedResume: resume?.optimizedResume ?? '',
    jobAnalysis: advanced.jobAnalysis,
    careerAssessment: advanced.careerAssessment,
    metaphysicalAnalysis: advanced.metaphysicalAnalysis,
  };
}
