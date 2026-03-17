import { ResumeAnalysisResult, FileData } from '../types';

export async function analyzeResume(
  resumeText: string,
  resumeFile: FileData | null,
  jobText: string,
  jobImages: FileData[],
  retries = 1
): Promise<ResumeAnalysisResult> {
  try {
    const response = await fetch('/.netlify/functions/analyze-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, resumeFile, jobText, jobImages }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || '分析失败');
    }

    return data as ResumeAnalysisResult;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return analyzeResume(
        resumeText,
        resumeFile,
        jobText,
        jobImages,
        retries - 1
      );
    }
    throw error;
  }
}