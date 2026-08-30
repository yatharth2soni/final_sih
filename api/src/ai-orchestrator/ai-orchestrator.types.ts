export type AiProviderType = 'gemini' | 'groq' | 'openrouter' | 'freellm' | 'deterministic';

export interface AiCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface AiProviderInterface {
  readonly name: AiProviderType;
  isAvailable(): boolean;
  generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options?: AiCompletionOptions,
  ): Promise<string>;
}

export interface CitationReference {
  resourceType: 'Mine' | 'ComplianceRequirement' | 'ComplianceRecord' | 'Violation' | 'CorrectiveAction' | 'RiskScore' | 'Grievance' | 'Inspection' | 'Regulation';
  resourceId?: string;
  label: string;
  sectionOrRule?: string;
}

export interface AiChatResponse {
  answer: string;
  language: 'en' | 'hi';
  intent: string;
  provider: AiProviderType;
  citations: CitationReference[];
  confidence?: number;
  dataAsOf: string;
  disclaimer: string;
  isOutOfScope?: boolean;
}

export interface AiInspectionAnalysis {
  summary: string;
  riskAssessment: {
    potentialSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    scoreContribution: number;
    hazardCategories: string[];
  };
  recommendedViolations: Array<{
    findingTitle: string;
    description: string;
    statutoryReference: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  recommendedCorrectiveActions: Array<{
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    slaHours: number;
    recommendedOfficerRole: string;
  }>;
  provider: AiProviderType;
}

export interface AiRiskExplanation {
  mineName: string;
  score: number;
  riskBand: string;
  plainLanguageSummary: string;
  topContributingFactors: Array<{
    factorName: string;
    weightPercentage: number;
    explanation: string;
  }>;
  preventiveDirectives: string[];
  provider: AiProviderType;
}

export interface AiActionRecommendation {
  violationId?: string;
  title: string;
  description: string;
  statutoryMandate: string;
  slaDays: number;
  recommendedSteps: string[];
  targetOfficerRole: string;
  verificationCriteria: string;
  provider: AiProviderType;
}
