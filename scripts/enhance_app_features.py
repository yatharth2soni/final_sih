import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add imports for SatelliteMonitoringPanel and INDIAN_MINES_MASTER
if 'SatelliteMonitoringPanel' not in code:
    code = code.replace(
        'import { GisMap } from "./components/GisMap";',
        'import { GisMap } from "./components/GisMap";\nimport { SatelliteMonitoringPanel } from "./components/SatelliteMonitoringPanel";\nimport { INDIAN_MINES_MASTER } from "./data/indianMinesMaster";'
    )

# 2. Add telemetry helpers before export default function App()
helper_code = '''
// ─── Deterministic Telemetry & Nearby Mines Engine ───────────────────────────
export function getMineTelemetry(mine) {
  if (!mine) return { methane: "0.28%", methaneVal: 0.28, coPpm: "4.2 ppm", coVal: 4.2, riskScore: 45, riskBand: "MEDIUM", dust: "1.8 mg/m³", airflow: "Nominal (3.2 m/s)", workersOnShift: 318, temperature: "31°C", humidity: "65%" };
  
  const seed = (mine.name || mine.id || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isGassy = /jharia|dipka|underground|block-4/i.test(mine.name || "");
  const baseMethane = isGassy ? 0.38 + ((seed % 35) / 100) : 0.12 + ((seed % 20) / 100);
  const methaneStr = `${baseMethane.toFixed(2)}%`;
  
  const baseCo = isGassy ? 5.2 + (seed % 40) / 10 : 2.1 + (seed % 25) / 10;
  const coStr = `${baseCo.toFixed(1)} ppm`;
  
  const baseDust = 1.4 + ((seed % 18) / 10);
  const dustStr = `${baseDust.toFixed(1)} mg/m³`;
  
  const baseRisk = isGassy ? 68 + (seed % 24) : 25 + (seed % 35);
  const clampedRisk = Math.min(94, Math.max(18, baseRisk));
  const band = clampedRisk >= 70 ? "HIGH" : clampedRisk >= 40 ? "MEDIUM" : "LOW";
  
  const workers = 280 + (seed % 240);
  const airflow = baseMethane > 0.65 ? "Elevated (4.8 m/s)" : "Nominal (3.1 m/s)";
  
  return {
    methane: methaneStr,
    methaneVal: parseFloat(baseMethane.toFixed(2)),
    coPpm: coStr,
    coVal: parseFloat(baseCo.toFixed(1)),
    dust: dustStr,
    riskScore: clampedRisk,
    riskBand: band,
    airflow,
    workersOnShift: workers,
    temperature: `${28 + (seed % 7)}°C`,
    humidity: `${62 + (seed % 25)}%`,
  };
}

export function getNearbyMines(activeMine, allMines = INDIAN_MINES_MASTER) {
  if (!activeMine || !allMines || allMines.length === 0) return [];
  const lat1 = activeMine.latitude || 23.75;
  const lon1 = activeMine.longitude || 86.41;
  
  const toRad = (v) => (v * Math.PI) / 180;
  const haversineKm = (la1, lo1, la2, lo2) => {
    const R = 6371;
    const dLat = toRad(la2 - la1);
    const dLon = toRad(lo2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(la1)) * Math.cos(toRad(la2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };
  
  return allMines
    .filter(m => m.id !== activeMine.id && m.name !== activeMine.name)
    .map(m => {
      const dist = haversineKm(lat1, lon1, m.latitude || 23.7, m.longitude || 86.4);
      const tele = getMineTelemetry(m);
      return {
        ...m,
        distanceKm: dist,
        riskScore: tele.riskScore,
        riskBand: tele.riskBand,
        methane: tele.methane,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);
}

'''

if 'export function getMineTelemetry' not in code:
    code = code.replace('export default function App() {', helper_code + 'export default function App() {')

# 3. Add customObservations state and compute activeMineTelemetry
if 'const [customObservations, setCustomObservations]' not in code:
    code = code.replace(
        'const [obsType, setObsType] = useState("unsafe_condition");',
        'const [customObservations, setCustomObservations] = useState([]);\n  const [obsType, setObsType] = useState("unsafe_condition");'
    )

# 4. Integrate activeMineTelemetry into activeMine definition
active_mine_pattern = r'const activeMine = .*?;\s*const computedRiskScore = .*?;\s*const computedRiskBand = .*?;'
active_mine_replacement = '''const activeMine = (liveMines && liveMines.find(m => m.id === selectedMineId)) || liveMines[0] || (currentUser?.mineBlock ? (INDIAN_MINES_MASTER.find(m => m.name.toLowerCase().includes(currentUser.mineBlock.toLowerCase())) || { id: "user-mine", name: currentUser.mineBlock, code: "CIL-SITE-01", location: currentUser.mineBlock }) : INDIAN_MINES_MASTER[0]);

  const activeMineTelemetry = getMineTelemetry(activeMine);
  const computedRiskScore = liveRiskScore?.score ?? liveGovOverview?.risk?.overallScore ?? activeMineTelemetry.riskScore;
  const computedRiskBand = liveRiskScore?.band ?? liveGovOverview?.risk?.band ?? activeMineTelemetry.riskBand;'''

code = re.sub(active_mine_pattern, active_mine_replacement, code, flags=re.DOTALL)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Applied enhancements to src/App.jsx successfully!")
