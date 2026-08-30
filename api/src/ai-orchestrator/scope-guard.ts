import { Injectable } from '@nestjs/common';

@Injectable()
export class ScopeGuard {
  private readonly allowedKeywords: string[] = [
    'mine', 'mining', 'coal', 'jharia', 'korba', 'raniganj', 'singrauli',
    'safety', 'compliance', 'inspection', 'violation', 'capa', 'corrective',
    'risk', 'anomaly', 'hazard', 'strata', 'roof', 'convergence', 'bolt',
    'ventilation', 'methane', 'ch4', 'co', 'gas', 'dust', 'pm10', 'pm25',
    'attendance', 'worker', 'contractor', 'grievance', 'dgms', 'cmr',
    'mines act', 'scamp', 'statutory', 'report', 'audit', 'sensor',
    'production', 'environment', 'overburden', 'seam', 'shaft', 'pit',
    'blast', 'seismograph', 'vibration', 'temperature', 'shelter',
    // Hindi keywords in Latin and Devanagari script
    'खान', 'खदान', 'कोयला', 'सुरक्षा', 'अनुपालन', 'निरीक्षण', 'उल्लंघन',
    'जोखिम', 'गैस', 'मीथेन', 'धूल', 'कर्मचारी', 'ठेकेदार', 'शिकायत',
    'रिपोर्ट', 'ऑडिट', 'वेंटिलेशन', 'उत्पादन', 'पर्यावरण', 'डीजीएमएस',
    'suraksha', 'khanan', 'koyla', 'nirikshan', 'anupalan', 'jokhim', 'shikayat',
  ];

  private readonly jailbreakPatterns: RegExp[] = [
    /ignore previous instructions/i,
    /you are now a/i,
    /DAN mode/i,
    /jailbreak/i,
    /system prompt/i,
    /reveal your instructions/i,
    /override rules/i,
  ];

  public readonly OUT_OF_SCOPE_MESSAGE_EN =
    'This AI assistant is designed specifically for Khanan Suraksha and coal-mine governance, safety, compliance, inspections, risk, and related project functions. Please ask a question within this scope.';

  public readonly OUT_OF_SCOPE_MESSAGE_HI =
    'यह एआई सहायक विशेष रूप से खनन सुरक्षा और कोयला खदान शासन, सुरक्षा, वैधानिक अनुपालन, निरीक्षण, जोखिम और संबंधित कार्यों के लिए डिज़ाइन किया गया है। कृपया इस दायरे के भीतर प्रश्न पूछें।';

  public isWithinScope(query: string): boolean {
    if (!query || query.trim().length === 0) return false;

    // Check for obvious jailbreak attempts
    for (const pattern of this.jailbreakPatterns) {
      if (pattern.test(query)) {
        return false;
      }
    }

    const lower = query.toLowerCase();

    // Queries asking for general help/capabilities within the app are allowed
    if (
      lower.includes('help') ||
      lower.includes('capability') ||
      lower.includes('what can you do') ||
      lower.includes('मदद') ||
      lower.includes('सहायता') ||
      lower.includes('नमस्ते') ||
      lower.includes('hello') ||
      lower.includes('hi')
    ) {
      return true;
    }

    // Check if at least one domain keyword is present
    return this.allowedKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
  }

  public getScopeRejectionResponse(language: 'en' | 'hi' = 'en') {
    return {
      answer: language === 'hi' ? this.OUT_OF_SCOPE_MESSAGE_HI : this.OUT_OF_SCOPE_MESSAGE_EN,
      language,
      intent: 'OUT_OF_SCOPE',
      provider: 'deterministic' as const,
      citations: [],
      dataAsOf: new Date().toISOString(),
      disclaimer: 'Informational governance policy restriction.',
      isOutOfScope: true,
    };
  }
}
