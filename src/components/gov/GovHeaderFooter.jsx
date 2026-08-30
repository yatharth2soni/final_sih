import React, { useState, useEffect } from "react";

// ── State Emblem of India (Lion Capital of Ashoka) SVG ──
export function AshokaEmblemIcon({ className = "goi-ashoka-emblem", style }) {
  return (
    <svg viewBox="0 0 100 130" fill="currentColor" className={className} style={{ width: 44, height: 56, ...style }} aria-label="State Emblem of India">
      {/* Central Lion Head */}
      <path d="M50 8 C43 8 38 12 37 18 C36 24 38 29 41 33 C38 36 37 41 38 46 C39 52 43 56 50 56 C57 56 61 52 62 46 C63 41 62 36 59 33 C62 29 64 24 63 18 C62 12 57 8 50 8 Z" fill="#c59b27" />
      {/* Left Lion Head */}
      <path d="M36 18 C31 16 26 19 24 24 C22 29 23 35 27 39 C25 43 25 48 27 52 C29 57 34 60 40 60 C38 55 37 49 38 43 C36 38 35 32 37 27 C36 24 36 21 36 18 Z" fill="#d4af37" />
      {/* Right Lion Head */}
      <path d="M64 18 C69 16 74 19 76 24 C78 29 77 35 73 39 C75 43 75 48 73 52 C71 57 66 60 60 60 C62 55 63 49 62 43 C64 38 65 32 63 27 C64 24 64 21 64 18 Z" fill="#d4af37" />
      {/* Base Abacus Platform with Dharma Chakra */}
      <rect x="18" y="66" width="64" height="14" rx="2" fill="#c59b27" />
      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="73" r="6" fill="#0b2545" stroke="#ffffff" strokeWidth="1" />
      <circle cx="50" cy="73" r="1.5" fill="#ffffff" />
      {/* Galloping Horse (Left) & Bull (Right) reliefs */}
      <ellipse cx="32" cy="73" rx="4" ry="2.5" fill="#0b2545" />
      <ellipse cx="68" cy="73" rx="4" ry="2.5" fill="#0b2545" />
      {/* Lotus Bell Base */}
      <path d="M22 80 C26 94 38 98 50 98 C62 98 74 94 78 80 Z" fill="#c59b27" />
      {/* Motto: SATYAMEVA JAYATE (सत्यमेव जयते) */}
      <text x="50" y="112" textAnchor="middle" fill="#c59b27" fontSize="9.5" fontWeight="900" fontFamily="'Noto Sans Devanagari', 'Satoshi', sans-serif" letterSpacing="0.8">
        सत्यमेव जयते
      </text>
    </svg>
  );
}

// ── Topmost Government Utility & Accessibility Bar ──
export function GoITopUtilityBar({ lang, onToggleLang, onShowToast }) {
  const [fontSize, setFontSize] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    document.documentElement.setAttribute("data-font-size", size);
    if (onShowToast) onShowToast(lang === "en" ? `Font size adjusted to ${size}` : `फ़ॉन्ट आकार ${size} सेट किया गया`);
  };

  const handleContrastToggle = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
    if (onShowToast) onShowToast(lang === "en" ? (next ? "High Contrast Mode Active" : "Standard Contrast Restored") : (next ? "उच्च कंट्रास्ट मोड सक्रिय" : "मानक मोड बहाल"));
  };

  return (
    <>
      {/* 1. National Tricolor Strip */}
      <div className="goi-tricolor-strip" />

      {/* 2. Top Utility & Accessibility Bar */}
      <div className="goi-top-utility-bar">
        <div className="goi-ministry-title">
          <span>🇮🇳</span>
          <span>
            {lang === "en"
              ? "GOVERNMENT OF INDIA · MINISTRY OF COAL · DGMS"
              : "भारत सरकार · खान मंत्रालय · खान सुरक्षा महानिदेशालय"}
          </span>
        </div>

        <div className="goi-accessibility-group">
          {/* Font Sizing Controls */}
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#94a3b8", marginRight: 2 }}>{lang === "en" ? "Text:" : "आकार:"}</span>
            <button
              type="button"
              className="goi-access-btn"
              title="Decrease Font Size (A-)"
              onClick={() => handleFontSizeChange("small")}
            >
              A-
            </button>
            <button
              type="button"
              className="goi-access-btn"
              title="Default Font Size (A)"
              onClick={() => handleFontSizeChange("normal")}
            >
              A
            </button>
            <button
              type="button"
              className="goi-access-btn"
              title="Increase Font Size (A+)"
              onClick={() => handleFontSizeChange("large")}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            className="goi-contrast-btn"
            title="Toggle High Contrast Mode"
            onClick={handleContrastToggle}
          >
            {highContrast ? "☀ Normal" : "◑ Contrast"}
          </button>

          {/* Bilingual Language Switcher Button */}
          <button
            type="button"
            className="goi-access-btn"
            style={{ background: "#ff9933", color: "#06172b", fontWeight: 800, padding: "2px 8px" }}
            onClick={onToggleLang}
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Official Government Portal Main Brand Header ──
export function GoIMainBrandBar({ lang }) {
  return (
    <div className="goi-main-brand-bar">
      <div className="goi-brand-identity">
        <AshokaEmblemIcon />
        <div className="goi-brand-headings">
          <div className="goi-portal-name-hi">
            खनन सुरक्षा — राष्ट्रीय कोयला खान सुरक्षा एवं वैधानिक अनुपालन पोर्टल
          </div>
          <div className="goi-portal-name-en">
            KHANAN SURAKSHA — National Coal Mines Safety & Compliance Grid
          </div>
          <div className="goi-ministry-tag">
            {lang === "en"
              ? "Ministry of Coal & Directorate General of Mines Safety (DGMS) · CMR-2017 Integrated System"
              : "खान मंत्रालय एवं खान सुरक्षा महानिदेशालय (DGMS), भारत सरकार · कोयला खान विनियम 2017"}
          </div>
        </div>
      </div>

      <div className="goi-portal-status-badges">
        <div className="goi-statutory-seal-badge">
          <span>🏛️</span>
          <span>{lang === "en" ? "DGMS CMR-2017 CERTIFIED" : "डीजीएमएस वैधानिक प्रमाणित"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Live Official Gazette & Technical Circulars Marquee Ticker ──
export function GoIGazetteMarquee({ lang }) {
  return (
    <div className="goi-gazette-bar">
      <div className="goi-gazette-label">
        <span>📢</span>
        <span>{lang === "en" ? "DGMS GAZETTE & CIRCULARS" : "डीजीएमएस परिपत्र एवं अधिसूचनाएँ"}</span>
      </div>
      <div className="goi-gazette-marquee-container">
        <div className="goi-gazette-marquee-content">
          <span>
            {lang === "en"
              ? "DGMS Circular 2026/04: Mandatory Continuous Tele-monitoring of Methane (CH₄ <0.75%) across all Degree-II & III Underground Coal Mines under CMR Reg 108."
              : "डीजीएमएस परिपत्र 2026/04: सीएमआर विनियम 108 के तहत सभी डिग्री-II एवं III भूमिगत खदानों में निरंतर मीथेन टेली-मॉनिटरिंग (<0.75%) अनिवार्य।"}
          </span>
          <span>
            {lang === "en"
              ? "Statutory Directive: Monsoon Inundation & Slope Stability Audits (CMR Reg 106) initiated across 115+ National Opencast & Underground Projects."
              : "वैधानिक निर्देश: 115+ राष्ट्रीय ओपनकास्ट एवं भूमिगत परियोजनाओं में मानसून सुरक्षा तथा ढलान स्थिरता ऑडिट (सीएमआर 106) प्रारंभ।"}
          </span>
          <span>
            {lang === "en"
              ? "Ministry of Coal Notice: 100% Biometric Safety Gate Logging & Digital Contractor Passes active on Central Governance Grid."
              : "कोयला मंत्रालय सूचना: केंद्रीय शासन ग्रिड पर 100% बायोमेट्रिक सुरक्षा गेट लॉगिंग एवं डिजिटल कांट्रैक्टर पास अनिवार्य रूप से सक्रिय।"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Official Government of India Portal Footer ──
export function GoIPortalFooter({ lang }) {
  return (
    <footer className="goi-portal-footer" role="contentinfo">
      <div className="goi-footer-grid">
        {/* Column 1: Statutory Framework */}
        <div className="goi-footer-col">
          <h4>{lang === "en" ? "Statutory & Acts" : "वैधानिक अधिनियम एवं नियम"}</h4>
          <ul>
            <li><span>✦ Mines Act, 1952 (Act No. 35 of 1952)</span></li>
            <li><span>✦ Coal Mines Regulations (CMR), 2017</span></li>
            <li><span>✦ Mines Vocational Training Rules, 1966</span></li>
            <li><span>✦ Mines Rescue Rules, 1985 & SCAMP</span></li>
            <li><span>✦ DGMS Technical Circulars & Standards</span></li>
          </ul>
        </div>

        {/* Column 2: Emergency Helplines */}
        <div className="goi-footer-col">
          <h4>{lang === "en" ? "Emergency & Safety" : "आपातकालीन एवं सहायता"}</h4>
          <ul>
            <li><span>📞 {lang === "en" ? "DGMS Toll-Free Helpline: 1800-11-MINE (6463)" : "डीजीएमएस टोल-फ्री हेल्पलाइन: 1800-11-MINE (6463)"}</span></li>
            <li><span>🚨 {lang === "en" ? "Mine Rescue Control: 1800-345-MINE" : "खदान बचाव नियंत्रण: 1800-345-MINE"}</span></li>
            <li><span>✉️ contact-dgms@gov.in</span></li>
            <li><span>📍 Directorate General of Mines Safety, Dhanbad, Jharkhand - 826001</span></li>
          </ul>
        </div>

        {/* Column 3: National Portals */}
        <div className="goi-footer-col">
          <h4>{lang === "en" ? "Government Portals" : "प्रमुख सरकारी पोर्टल"}</h4>
          <ul>
            <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer">🌐 National Portal of India (india.gov.in)</a></li>
            <li><a href="https://coal.nic.in" target="_blank" rel="noopener noreferrer">🏛️ Ministry of Coal (coal.nic.in)</a></li>
            <li><a href="https://dgms.gov.in" target="_blank" rel="noopener noreferrer">🛡️ DGMS Official Portal (dgms.gov.in)</a></li>
            <li><a href="https://parivesh.nic.in" target="_blank" rel="noopener noreferrer">🌿 PARIVESH Environmental Portal</a></li>
          </ul>
        </div>

        {/* Column 4: Website Governance */}
        <div className="goi-footer-col">
          <h4>{lang === "en" ? "Portal Governance" : "पोर्टल शासन"}</h4>
          <ul>
            <li><span>🛡️ GIGW 3.0 (Guidelines for Indian Govt Websites)</span></li>
            <li><span>🔒 256-Bit SSL / TLS Encrypted Statutory Grid</span></li>
            <li><span>📋 Privacy Policy · Hyperlinking Policy</span></li>
            <li><span>⚖️ Terms of Statutory Use & Disclaimer</span></li>
          </ul>
        </div>
      </div>

      <div className="goi-footer-bottom">
        <div>
          © 2026 {lang === "en" ? "Ministry of Coal, Government of India. Content Managed by DGMS & Ministry of Coal." : "खान मंत्रालय, भारत सरकार। सामग्री प्रबंधन: खान सुरक्षा महानिदेशालय।"}
        </div>
        <div className="goi-nic-badge">
          <span>🏛️</span>
          <span>{lang === "en" ? "Designed, Developed & Hosted by National Informatics Centre (NIC)" : "राष्ट्रीय सूचना विज्ञान केंद्र (एनआईसी) द्वारा डिजाइन, विकसित एवं होस्ट किया गया"}</span>
        </div>
        <div>
          {lang === "en" ? "Visitors Count:" : "आगंतुक संख्या:"} <span className="goi-hit-counter">01,489,204</span> · {lang === "en" ? "Last Updated: 30 Aug 2026" : "अंतिम अद्यतन: 30 अगस्त 2026"}
        </div>
      </div>
    </footer>
  );
}
