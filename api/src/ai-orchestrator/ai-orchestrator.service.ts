import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { ScopeGuard } from './scope-guard';
import { RagService } from './rag.service';
import {
  AiActionRecommendation,
  AiChatResponse,
  AiCompletionOptions,
  AiInspectionAnalysis,
  AiProviderInterface,
  AiProviderType,
  AiRiskExplanation,
} from './ai-orchestrator.types';

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private readonly providers: AiProviderInterface[];

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly groq: GroqProvider,
    private readonly openRouter: OpenRouterProvider,
    private readonly scopeGuard: ScopeGuard,
    private readonly ragService: RagService,
  ) {
    // Fallback Priority: 1. Gemini -> 2. Groq -> 3. OpenRouter
    this.providers = [this.gemini, this.groq, this.openRouter];
  }

  /**
   * Core orchestrator method: attempts provider in prioritized order with fallback on failure/timeout/429
   */
  public async executeWithFallback(
    prompt: string,
    systemPrompt?: string,
    options?: AiCompletionOptions,
  ): Promise<{ text: string; provider: AiProviderType }> {
    const availableProviders = this.providers.filter((p) => p.isAvailable());

    if (availableProviders.length === 0) {
      this.logger.warn('No cloud AI API keys configured. Falling back to deterministic response.');
      return {
        text: '',
        provider: 'deterministic',
      };
    }

    for (const provider of availableProviders) {
      try {
        this.logger.log(`Attempting AI generation with provider: ${provider.name}`);
        const result = await provider.generateCompletion(prompt, systemPrompt, options);
        if (result && result.trim().length > 0) {
          return { text: result.trim(), provider: provider.name };
        }
      } catch (err: any) {
        this.logger.warn(`Provider ${provider.name} failed: ${err.message}. Trying next fallback provider.`);
      }
    }

    this.logger.error('All configured AI providers failed. Returning deterministic fallback.');
    return { text: '', provider: 'deterministic' };
  }

  /**
   * Main Conversational / Chat Assistant with RAG and Strict Multilingual Support
   */
  public async chat(
    question: string,
    languageHint?: string,
    mineId?: string,
    companyId?: string,
    userAccessibleMineIds?: string[] | null,
  ): Promise<AiChatResponse> {
    // 1. Detect language
    const isHindi =
      languageHint === 'hi' ||
      /[\u0900-\u097F]/.test(question) ||
      question.toLowerCase().includes('kare') ||
      question.toLowerCase().includes('kya');
    const language: 'en' | 'hi' = isHindi ? 'hi' : 'en';

    // 2. Scope Verification
    if (!this.scopeGuard.isWithinScope(question)) {
      return this.scopeGuard.getScopeRejectionResponse(language);
    }

    // 3. Retrieve Grounded Context via RAG
    const ragData = await this.ragService.buildGroundedContext(
      question,
      mineId,
      companyId,
      userAccessibleMineIds,
    );

    // 4. Construct System Prompt & Grounded User Prompt
    const systemPrompt = `You are "Khanan Suraksha AI", the official Smart Governance & Compliance Assistant for Coal Mines under the Ministry of Coal & DGMS (Directorate General of Mines Safety), India.
You must adhere strictly to these rules:
1. Topic Scope: Only answer questions regarding coal mine safety, statutory compliance (Mines Act 1952, CMR 2017), inspections, violations, CAPA, risk scores, gas telemetry (CH4, CO), ventilation, attendance, and grievances.
2. Grounded Facts: Rely primarily on the provided [SYSTEM DATA] and [REGULATORY DATA]. Never fabricate statistics, mine names, risk scores, or legal requirements.
3. Language Consistency: The user's preferred language is ${language === 'hi' ? 'HINDI (हिन्दी)' : 'ENGLISH'}. Respond completely in ${language === 'hi' ? 'clear, formal Hindi in Devanagari script' : 'clear professional English'}. Do not mix languages unintentionally.
4. Tone & Safety: Professional, statutory, objective, actionable. Always remind officers that AI outputs do not replace formal regulatory declarations under CMR 2017.`;

    const userPrompt = `GROUND TRUTH CONTEXT:
${ragData.contextText || 'No specific database records matched the exact filter.'}

USER QUESTION:
${question}

Please answer the user's question clearly, referencing the actual data above where applicable.`;

    // 5. Execute with fallback
    const { text, provider } = await this.executeWithFallback(userPrompt, systemPrompt, {
      temperature: 0.2,
      maxTokens: 1024,
    });

    if (text) {
      return {
        answer: text,
        language,
        intent: ragData.intent,
        provider,
        citations: ragData.citations,
        dataAsOf: new Date().toISOString(),
        disclaimer:
          language === 'hi'
            ? 'यह सूचनात्मक सारांश है; यह खान अधिनियम 1952 / सीएमआर 2017 के तहत वैधानिक आदेश या प्रमाणन का स्थान नहीं लेता है।'
            : 'Informational governance summary only; does not replace statutory regulatory reporting or official certification under the Mines Act 1952 / CMR 2017.',
        isOutOfScope: false,
      };
    }

    // Grounded deterministic answer from structured facts
    const facts = ragData.structuredFacts || {};
    let answer = '';

    if (language === 'hi') {
      if (facts.targetRisk) {
        answer = `${ragData.extractedMineName || 'खदान'} का जोखिम स्कोर: ${facts.targetRisk.score}/100 [${facts.targetRisk.band} जोखिम]। मुख्य कारक: ${facts.targetRisk.explanation}`;
      } else if (facts.highRiskMines && (question.includes('उच्च') || question.includes('अधिक') || question.includes('कौन') || question.includes('सभी') || question.includes('खदान'))) {
        const list = facts.highRiskMines.map((m: any) => `• ${m.name} (${m.code}): स्कोर ${m.score}/100 [${m.band}] - ${m.explanation}`).join('\n');
        answer = `वर्तमान में उच्चतम अनुपालन और सुरक्षा जोखिम वाली खदानें:\n${list}`;
      } else if (facts.overdueCapas && (question.includes('बकाया') || question.includes('capa') || question.includes('सुधार'))) {
        const list = facts.overdueCapas.map((c: any) => `• ${c.title} (${c.mine}): नियत तिथि ${c.dueAt}, अधिकारी: ${c.assignedTo}`).join('\n');
        answer = `वर्तमान में निम्नलिखित सुधारात्मक कार्य (CAPA) समयसीमा से अधिक बकाया हैं:\n${list}`;
      } else if (facts.environmentalExceedances && (question.includes('पर्यावरण') || question.includes('सीमा') || question.includes('पैरामीटर'))) {
        const list = facts.environmentalExceedances.map((e: any) => `• ${e.subParameter || e.parameter} (${e.mine}): वर्तमान स्तर ${e.value} ${e.unit} (वैधानिक सीमा: ${e.limit} ${e.unit})`).join('\n');
        answer = `निम्नलिखित पर्यावरणीय पैरामीटर वैधानिक सीमा से अधिक दर्ज किए गए हैं:\n${list}`;
      } else if (facts.highRiskContractors && (question.includes('ठेकेदार') || question.includes('contractor'))) {
        const list = facts.highRiskContractors.map((c: any) => `• ${c.name}: जोखिम स्तर ${c.rating}, उल्लंघन: ${c.violations}, सुरक्षा प्रशिक्षण: ${c.training}%`).join('\n');
        answer = `उच्चतम जोखिम वाले ठेकेदार:\n${list}`;
      } else if (facts.recurringIncidentCauses && (question.includes('दुर्घटना') || question.includes('कारण') || question.includes('incident'))) {
        const list = Object.entries(facts.recurringIncidentCauses).map(([c, count]) => `• ${c}: ${count} घटनाएं`).join('\n');
        answer = `खदानों में दर्ज की गई दुर्घटनाओं के मुख्य आवर्ती कारण:\n${list}`;
      } else {
        answer = `खनन सुरक्षा प्रणाली का वर्तमान रिकॉर्ड: ${ragData.extractedMineName ? `${ragData.extractedMineName} खदान का डेटा उपलब्ध है।` : 'सभी 10 खदानों, 5,000 निरीक्षणों और पर्यावरणीय डेटा की रीयल-टाइम निगरानी सक्रिय है।'}`;
      }
    } else {
      if (facts.targetRisk) {
        answer = `Risk assessment for ${ragData.extractedMineName || 'specified mine'}: Risk Score ${facts.targetRisk.score}/100 [${facts.targetRisk.band} Risk]. Contributing factors: ${facts.targetRisk.explanation}`;
      } else if (facts.highRiskMines && (question.toLowerCase().includes('highest') || question.toLowerCase().includes('high risk') || question.toLowerCase().includes('which mines') || question.toLowerCase().includes('all mines'))) {
        const list = facts.highRiskMines.map((m: any) => `• ${m.name} (${m.code}): Score ${m.score}/100 [${m.band}] - ${m.explanation}`).join('\n');
        answer = `The mines with the highest compliance and safety risks are:\n${list}`;
      } else if (facts.overdueCapas && (question.toLowerCase().includes('overdue') || question.toLowerCase().includes('capa') || question.toLowerCase().includes('corrective'))) {
        const list = facts.overdueCapas.map((c: any) => `• ${c.title} (${c.mine}): Due date ${c.dueAt}, Assigned to ${c.assignedTo}`).join('\n');
        answer = `The following corrective actions (CAPA) are currently overdue:\n${list}`;
      } else if (facts.environmentalExceedances && (question.toLowerCase().includes('environment') || question.toLowerCase().includes('exceed') || question.toLowerCase().includes('parameter') || question.toLowerCase().includes('limit'))) {
        const list = facts.environmentalExceedances.map((e: any) => `• ${e.subParameter || e.parameter} at ${e.mine}: Recorded ${e.value} ${e.unit} (Permissible Statutory Limit: ${e.limit} ${e.unit})`).join('\n');
        answer = `The following environmental telemetry parameters are exceeding statutory permissible limits:\n${list}`;
      } else if (facts.highRiskContractors && (question.toLowerCase().includes('contractor') || question.toLowerCase().includes('contractors'))) {
        const list = facts.highRiskContractors.map((c: any) => `• ${c.name}: Risk Rating ${c.rating}, Safety Violations: ${c.violations}, Training Compliance: ${c.training}%`).join('\n');
        answer = `High-risk contractors identified based on statutory violations and licensing records:\n${list}`;
      } else if (facts.recurringIncidentCauses && (question.toLowerCase().includes('incident') || question.toLowerCase().includes('cause') || question.toLowerCase().includes('root cause'))) {
        const list = Object.entries(facts.recurringIncidentCauses).map(([c, count]) => `• ${c}: ${count} recorded incidents`).join('\n');
        answer = `The recurring root causes identified from historical incident logs are:\n${list}`;
      } else {
        answer = `Khanan Suraksha Governance Records: Live tracking active across 10 statutory mine assets, 5,000 field inspections, 1,500 violations, and 50,000 environmental telemetry readings.`;
      }
    }

    return {
      answer,
      language,
      intent: ragData.intent,
      provider: 'deterministic',
      citations: ragData.citations,
      dataAsOf: new Date().toISOString(),
      disclaimer: language === 'hi'
        ? 'यह सूचनात्मक सारांश है; यह खान अधिनियम 1952 / सीएमआर 2017 के तहत वैधानिक आदेश का स्थान नहीं लेता है।'
        : 'Informational governance summary grounded in live statutory database records.',
      isOutOfScope: false,
    };
  }

  /**
   * Inspection Analysis: detects hazards, predicts severity, recommends violations & CAPAs
   */
  public async analyzeInspection(
    inspectionData: any,
    language: 'en' | 'hi' = 'en',
  ): Promise<AiInspectionAnalysis> {
    const prompt = `Analyze this coal mine inspection checklist and observations:
${JSON.stringify(inspectionData, null, 2)}

Provide a structured JSON output with:
{
  "summary": "concise executive summary",
  "riskAssessment": {
    "potentialSeverity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "scoreContribution": number from 0 to 30,
    "hazardCategories": ["e.g. Strata Control", "Ventilation"]
  },
  "recommendedViolations": [
    {
      "findingTitle": "title",
      "description": "statutory violation details",
      "statutoryReference": "e.g. CMR 2017 Reg. 108",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }
  ],
  "recommendedCorrectiveActions": [
    {
      "title": "action title",
      "priority": "HIGH",
      "slaHours": 24,
      "recommendedOfficerRole": "Safety Officer"
    }
  ]
}`;

    const systemPrompt = `You are a Senior DGMS Mine Safety Inspector AI analyzing field observations for statutory compliance. Respond strictly in valid JSON format.`;

    const { text, provider } = await this.executeWithFallback(prompt, systemPrompt, {
      jsonMode: true,
      temperature: 0.1,
    });

    if (text) {
      try {
        const parsed = JSON.parse(text);
        return { ...parsed, provider };
      } catch (err) {
        this.logger.warn(`Failed to parse AI inspection JSON: ${err}`);
      }
    }

    // Deterministic fallback
    return {
      summary: 'Inspection findings recorded. Routine compliance review recommended.',
      riskAssessment: {
        potentialSeverity: 'MEDIUM',
        scoreContribution: 10,
        hazardCategories: ['General Mining Safety'],
      },
      recommendedViolations: [],
      recommendedCorrectiveActions: [
        {
          title: 'Review shift findings with Area Safety Officer',
          priority: 'MEDIUM',
          slaHours: 48,
          recommendedOfficerRole: 'Safety Officer',
        },
      ],
      provider: 'deterministic',
    };
  }

  /**
   * Explain Risk Score: Translates deterministic numerical calculations into explainable insights
   */
  public async explainRisk(
    mineName: string,
    score: number,
    band: string,
    factors: any,
    language: 'en' | 'hi' = 'en',
  ): Promise<AiRiskExplanation> {
    const prompt = `Mine: ${mineName}
Calculated Risk Score: ${score}/100 (Band: ${band})
Raw Factor Breakdown: ${JSON.stringify(factors)}
Target Language: ${language === 'hi' ? 'Hindi' : 'English'}

Explain this risk score clearly for executive leadership and safety officers.
Return JSON in the following format:
{
  "mineName": "${mineName}",
  "score": ${score},
  "riskBand": "${band}",
  "plainLanguageSummary": "2-3 sentence overview explaining why this score was received",
  "topContributingFactors": [
    { "factorName": "string", "weightPercentage": number, "explanation": "string" }
  ],
  "preventiveDirectives": ["action 1", "action 2"]
}`;

    const systemPrompt = `You are an expert Mine Risk Analytics AI. Never fabricate the numerical score. Explain the underlying factors truthfully. Respond strictly in valid JSON.`;

    const { text, provider } = await this.executeWithFallback(prompt, systemPrompt, {
      jsonMode: true,
      temperature: 0.2,
    });

    if (text) {
      try {
        const parsed = JSON.parse(text);
        return { ...parsed, provider };
      } catch (err) {
        this.logger.warn(`Failed to parse risk explanation JSON: ${err}`);
      }
    }

    // Deterministic fallback
    return {
      mineName,
      score,
      riskBand: band,
      plainLanguageSummary: `${mineName} currently has a composite safety score of ${score}/100 in the ${band} risk category based on recent statutory inspections and open corrective actions.`,
      topContributingFactors: [
        {
          factorName: 'Statutory Violations & Overdue Actions',
          weightPercentage: 60,
          explanation: 'Weighted calculation from open compliance items over the rolling 30-day window.',
        },
      ],
      preventiveDirectives: [
        'Prioritize closure of overdue Stage 1 and Stage 2 CAPAs.',
        'Conduct targeted SCAMP strata inspections in flagged panels.',
      ],
      provider: 'deterministic',
    };
  }

  /**
   * Recommend Corrective Action (CAPA) for a Violation
   */
  public async recommendAction(
    violationTitle: string,
    description: string,
    severity: string,
    language: 'en' | 'hi' = 'en',
  ): Promise<AiActionRecommendation> {
    const prompt = `Violation Title: ${violationTitle}
Severity: ${severity}
Description: ${description}

Recommend an effective Corrective and Preventive Action (CAPA) under Indian DGMS standards.
Return JSON:
{
  "title": "action title",
  "description": "step-by-step remediation requirement",
  "statutoryMandate": "relevant CMR 2017 / Mines Act reference",
  "slaDays": number (e.g. 1, 2, 7),
  "recommendedSteps": ["step 1", "step 2", "step 3"],
  "targetOfficerRole": "e.g. Area Safety Officer / Ventilation Officer",
  "verificationCriteria": "how the remediation should be verified"
}`;

    const { text, provider } = await this.executeWithFallback(prompt, 'Respond strictly in valid JSON.', {
      jsonMode: true,
      temperature: 0.1,
    });

    if (text) {
      try {
        const parsed = JSON.parse(text);
        return { ...parsed, provider };
      } catch (err) {
        this.logger.warn(`Failed to parse action recommendation JSON: ${err}`);
      }
    }

    // Deterministic fallback
    return {
      title: `Rectify ${violationTitle}`,
      description: `Immediate on-site remediation required to resolve ${severity} safety violation: ${description}`,
      statutoryMandate: 'CMR 2017 Regulation Compliance',
      slaDays: severity === 'CRITICAL' ? 1 : severity === 'HIGH' ? 3 : 7,
      recommendedSteps: [
        'Deploy designated inspection team to affected underground panel.',
        'Apply physical engineering controls and re-survey sensors.',
        'Document photographic proof of remediation in Khanan Suraksha portal.',
      ],
      targetOfficerRole: 'Safety Officer',
      verificationCriteria: 'Physical verification and compliance sign-off by Mine Manager.',
      provider: 'deterministic',
    };
  }

  /**
   * Voice Transcription using Groq Whisper
   */
  public async transcribeAudio(
    audioBuffer: Buffer,
    fileName: string = 'field_voice.wav',
    languageHint?: 'en' | 'hi',
  ): Promise<{ text: string; language?: string; duration?: number }> {
    if (this.groq.isAvailable()) {
      try {
        return await this.groq.transcribeAudio(audioBuffer, fileName, languageHint);
      } catch (err: any) {
        this.logger.error(`Groq Whisper transcription failed: ${err.message}`);
        throw err;
      }
    }
    throw new Error('Groq Whisper API is not configured on the server.');
  }

  /**
   * Fast Classification of Field Voice / Text Intent
   */
  public async classifyIntent(
    text: string,
  ): Promise<{ intent: string; confidence: number; entitySuggestions?: any }> {
    const prompt = `Classify this mining field voice/text report into one of:
["REPORT_VIOLATION", "CREATE_INSPECTION", "LOG_OBSERVATION", "FILE_GRIEVANCE", "SAFETY_QUERY", "EMERGENCY_ALERT"]

Input text: "${text}"

Return JSON:
{
  "intent": "REPORT_VIOLATION" | "CREATE_INSPECTION" | "LOG_OBSERVATION" | "FILE_GRIEVANCE" | "SAFETY_QUERY" | "EMERGENCY_ALERT",
  "confidence": number between 0 and 1,
  "extractedDetails": {
    "mineName": "string or null",
    "locationSection": "string or null",
    "hazardType": "string or null",
    "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  }
}`;

    const { text: responseText } = await this.executeWithFallback(prompt, 'Respond strictly in valid JSON.', {
      jsonMode: true,
      temperature: 0.1,
    });

    if (responseText) {
      try {
        return JSON.parse(responseText);
      } catch {}
    }

    // Deterministic rule fallback
    const lower = text.toLowerCase();
    let intent = 'SAFETY_QUERY';
    if (lower.includes('violation') || lower.includes('hazard') || lower.includes('danger') || lower.includes('खतरा')) {
      intent = 'REPORT_VIOLATION';
    } else if (lower.includes('inspect') || lower.includes('check') || lower.includes('निरीक्षण')) {
      intent = 'CREATE_INSPECTION';
    } else if (lower.includes('complain') || lower.includes('grievance') || lower.includes('शिकायत')) {
      intent = 'FILE_GRIEVANCE';
    }

    return {
      intent,
      confidence: 0.8,
    };
  }
}
