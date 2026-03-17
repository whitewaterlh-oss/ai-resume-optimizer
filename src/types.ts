export interface CareerAssessment {
  strengths: string[];
  weaknesses: string[];
  suitableRoles: string[];
  testQuestions: string[];
}

export interface JobAnalysis {
  positioning: string;
  realWorkContent: string[];
  hiddenTalentPersona: string[];
}

export interface MetaphysicalAnalysis {
  birthdayFound: boolean;
  zodiac?: string;
  bazi?: string;
  suitableRoles?: string[];
  auspiciousDirections?: string[];
  guidance?: string;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  analysis: string;
  deficiencies: string[];
  suggestions: string[];
  optimizedResume: string;
  metaphysicalAnalysis?: MetaphysicalAnalysis;
  careerAssessment?: CareerAssessment;
  jobAnalysis?: JobAnalysis;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}
