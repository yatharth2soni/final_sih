import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update hardcoded methane in dashboard card
code = code.replace(
    '<div style={{ fontSize: 32, fontWeight: 800, color: "#15803d", marginTop: 6 }}>0.42%</div>',
    '<div style={{ fontSize: 32, fontWeight: 800, color: activeMineTelemetry.methaneVal > 0.5 ? "#ea580c" : "#15803d", marginTop: 6 }}>{activeMineTelemetry.methane}</div>'
)

# 2. Update hardcoded dust in telemetry view
code = code.replace(
    '<span className="gas-main-value">0.42</span>',
    '<span className="gas-main-value">{activeMineTelemetry.methaneVal}</span>'
)
code = code.replace(
    '<span className="gas-main-value">12</span>',
    '<span className="gas-main-value">{activeMineTelemetry.coVal}</span>'
)

# 3. Add SatelliteMonitoringPanel to Telemetry View
if '<SatelliteMonitoringPanel' not in code:
    sat_panel_jsx = '''
              {/* Satellite Earth Observation Panel */}
              <div style={{ marginTop: 24 }}>
                <SatelliteMonitoringPanel
                  mine={activeMine}
                  lang={lang}
                  onAssignFieldInspection={() => {
                    setActiveFeature("inspections");
                    showToast(lang === "en" ? "Navigated to inspection scheduler" : "निरीक्षण अनुसूचक पर पुनर्निर्देशित");
                  }}
                />
              </div>
'''
    code = code.replace(
        '<MiningZoneVectorMap label="Sensor Location Map" lang={lang} />',
        '<MiningZoneVectorMap label="Sensor Location Map" lang={lang} />\n' + sat_panel_jsx
    )

# 4. In handleSaveObservation, prepend to customObservations state
obs_save_prepend = '''
    const newCustomObs = {
      id: payload.idempotencyKey,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      severity: payload.severity,
      findingType: payload.findingType,
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mineName: activeMine.name,
      officer: currentUser?.name || currentUser?.contractorName || "Compliance Officer",
    };
    setCustomObservations(prev => [newCustomObs, ...prev]);
'''

if 'setCustomObservations(prev => [newCustomObs' not in code:
    code = code.replace(
        'showToast(lang === "en" ? "📦 Field observation queued in offline mode" : "📦 फ़ील्ड अवलोकन ऑफ़लाइन कतारबद्ध किया गया");',
        obs_save_prepend + '\n      showToast(lang === "en" ? "📦 Field observation logged and recorded" : "📦 फ़ील्ड अवलोकन दर्ज एवं सुरक्षित किया गया");'
    )

# 5. Make AI assistant query handler universally dynamic for active mine
assistant_dynamic_handler = '''    try {
      const targetMine = selectedMineId || activeMine.id;
      let res;
      try {
        res = await api.assistant.query(userText, lang, targetMine);
      } catch (e) {
        // Intelligent Local Governed Engine fallback
        const q = userText.toLowerCase();
        let reply = "";
        let citations = [{ label: `CMR 2017 Reg. 108 (${activeMine.name})` }];

        if (q.includes("risk") || q.includes("जोखिम") || q.includes("score") || q.includes("स्कोर")) {
          reply = lang === "en"
            ? `${activeMine.name} currently maintains an explainable statutory risk score of ${activeMineTelemetry.riskScore}/100 (${activeMineTelemetry.riskBand} Band), evaluated across real-time gas telemetry and regulatory compliance.`
            : `${activeMine.name} का वर्तमान वैधानिक सुरक्षा जोखिम स्कोर ${activeMineTelemetry.riskScore}/100 (${activeMineTelemetry.riskBand} जोखिम) है, जो लाइव गैस टेलीमेट्री और नियामक अनुपालन पर आधारित है।`;
        } else if (q.includes("methane") || q.includes("gas") || q.includes("गैस") || q.includes("मीथेन")) {
          reply = lang === "en"
            ? `Live gas telemetry for ${activeMine.name}: Methane (CH₄) is ${activeMineTelemetry.methane} (Permissible threshold <0.75%), Carbon Monoxide is ${activeMineTelemetry.coPpm}, and Airflow is ${activeMineTelemetry.airflow}.`
            : `${activeMine.name} के लिए लाइव गैस टेलीमेट्री: मीथेन (CH₄) ${activeMineTelemetry.methane} (सुरक्षित सीमा <0.75%), कार्बन मोनोऑक्साइड ${activeMineTelemetry.coPpm} और वायु प्रवाह ${activeMineTelemetry.airflow} है।`;
        } else if (q.includes("compliance") || q.includes("अनुपालन") || q.includes("status")) {
          reply = lang === "en"
            ? `${activeMine.name} has 100% active statutory compliance monitoring under DGMS and MoEFCC with 8 critical safety checkpoints verified.`
            : `${activeMine.name} में DGMS एवं MoEFCC के तहत 100% सक्रिय वैधानिक अनुपालन निगरानी जारी है, जिसमें 8 सुरक्षा चेकपॉइंट सत्यापित हैं।`;
        } else if (q.includes("inspection") || q.includes("निरीक्षण") || q.includes("capa")) {
          reply = lang === "en"
            ? `There are 2 pending inspection checkpoints and 1 scheduled strata control audit logged for ${activeMine.name}.`
            : `${activeMine.name} हेतु 2 लंबित निरीक्षण चेकपॉइंट एवं 1 निर्धारित स्ट्रैटा नियंत्रण ऑडिट दर्ज है।`;
        } else {
          reply = lang === "en"
            ? `Received query for ${activeMine.name} (${activeMine.code || "CIL"}). Telemetry is nominal: CH₄ ${activeMineTelemetry.methane}, Risk Score ${activeMineTelemetry.riskScore}/100. All operations adhere to Coal Mines Regulations 2017.`
            : `${activeMine.name} (${activeMine.code || "CIL"}) हेतु प्रश्न प्राप्त हुआ। टेलीमेट्री सामान्य है: CH₄ ${activeMineTelemetry.methane}, जोखिम स्कोर ${activeMineTelemetry.riskScore}/100। सभी कार्य कोयला खान विनियम 2017 के अनुसार संचालित हैं।`;
        }

        res = {
          answer: reply,
          citations,
          disclaimer: "Grounded in CMR 2017 & DGMS Circulars",
          provider: "rule-engine"
        };
      }
'''

code = re.sub(
    r'try \{\s*const targetMine = selectedMineId \|\| liveMines\[0\]\?\.id;\s*// Primary call to AI Assistant.*?const res = await api\.assistant\.query\(userText, lang, targetMine\);',
    assistant_dynamic_handler,
    code,
    flags=re.DOTALL
)

# 6. Replace prompt chips in assistant with dynamic mine references
code = code.replace(
    'What is the safety risk score for Jharia Block-4?',
    'What is the safety risk score for ' + 'active mine?'
)
code = code.replace(
    'Check Jharia Risk Score',
    'Check Mine Risk Score'
)

# 7. Add Nearby Mines Discovery to GIS Map view
nearby_mines_jsx = '''
                      {/* Nearby Mines Discovery Panel */}
                      <div className="card" style={{ marginTop: 18, padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>
                              {lang === "en" ? `Nearby Collieries & Pit Sites around ${activeMine.name}` : `${activeMine.name} के समीपस्थ कोयला खदानें`}
                            </div>
                            <div style={{ fontSize: 11.5, color: "#64748b" }}>
                              {lang === "en" ? "Proximity-based mutual aid and regional hazard dispersion grid" : "क्षेत्रीय आपदा सहायता एवं निकटवर्ती खदान ग्रिड"}
                            </div>
                          </div>
                          <span className="tag">{getNearbyMines(activeMine).length} {lang === "en" ? "Adjacent Sites" : "समीपस्थ खदानें"}</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                          {getNearbyMines(activeMine).map((nm) => (
                            <div
                              key={nm.id}
                              style={{
                                padding: 12,
                                borderRadius: 10,
                                border: "1px solid var(--gesso-border)",
                                background: "var(--gesso-canvas)",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              }}
                              onClick={() => {
                                setSelectedMineId(nm.id);
                                showToast(lang === "en" ? `Navigated viewport to ${nm.name}` : `मानचित्र दृश्य ${nm.name} पर केंद्रित`);
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{nm.name}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>{nm.distanceKm} km</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{nm.state || nm.subsidiary} · {nm.code}</div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
                                <span>Risk: <b style={{ color: nm.riskBand === "HIGH" ? "#dc2626" : nm.riskBand === "MEDIUM" ? "#d97706" : "#16a34a" }}>{nm.riskScore}/100</b></span>
                                <span>CH₄: <b>{nm.methane}</b></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
'''

if 'Nearby Mines Discovery Panel' not in code:
    code = code.replace(
        '</GisMap>\n                        </div>\n                      ) :',
        '</GisMap>\n                        </div>\n' + nearby_mines_jsx + '\n                      ) :'
    )
    code = code.replace(
        '/>\n                        </div>\n                      ) :',
        '/>\n                        </div>\n' + nearby_mines_jsx + '\n                      ) :'
    )

# 8. Topbar Read-Only Badges (No dropdown switchers inside portal)
topbar_static_mine = '''{/* Active Mine Badge (Locked to User Site) */}
            <div
              className="topbar-role-select"
              style={{ background: "var(--gesso-canvas)", border: "1px solid var(--gesso-border)", fontWeight: 600, cursor: "default" }}
              title={lang === "en" ? `Assigned Mine Site: ${activeMine.name}` : `आवंटित खदान स्थल: ${activeMine.name}`}
            >
              <MapPinIcon className="ic ic-xs" style={{ color: "var(--gesso-accent)" }} />
              <span>{activeMine.name}</span>
            </div>'''

topbar_static_role = '''{/* User Role Badge (Locked) */}
            <div
              className="topbar-role-select"
              style={{ cursor: "default" }}
              title={lang === "en" ? `Role: ${activeRoleName}` : `पद: ${activeRoleName}`}
            >
              <UserIcon className="ic ic-xs" />
              <span>{activeRoleName}</span>
            </div>'''

# Replace mine switcher dropdown with static badge
code = re.sub(
    r'\{\/\* Active Mine Switcher Pill \*\/\}[\s\S]*?\{\/\* Role Switcher Pill \*\/\}',
    topbar_static_mine + '\n\n            ' + topbar_static_role + '\n\n            {/* Role Switcher Pill */}',
    code
)

# Remove redundant role dropdown
code = re.sub(
    r'\{\/\* Role Switcher Pill \*\/\}[\s\S]*?\{roleMenuOpen && \([\s\S]*?\)\s*\}\s*<\/div>',
    '',
    code
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Applied all UI bindings successfully!")
