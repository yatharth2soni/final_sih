import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMineTelemetry } from '../data/mineTelemetryHelper';

// Fix default leaflet marker asset paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// High-Resolution Multi-Modal Basemaps & Satellite Layers
const TILE_LAYERS = {
  GOOGLE_HYBRID: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  GOOGLE_TERRAIN: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  ESRI_SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  TOPO_3D: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  CARTO_LIGHT: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  CARTO_DARK: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
};

export function GisMap({
  onSelectMine,
  selectedMineId,
  mines = [],
  riskScores = {},
  language = 'en',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [filterBand, setFilterBand] = useState('ALL');
  const [mapMode, setMapMode] = useState('GOOGLE_HYBRID'); // Default to Google Satellite Hybrid
  const [viewTab, setViewTab] = useState('MAP'); // 'MAP' | '3D_GEOLOGY' | 'GOOGLE_EARTH'
  const [is3DView, setIs3DView] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(32); // Degrees of 3D oblique perspective
  const [rotationAngle, setRotationAngle] = useState(0);

  // Advanced GIS Analysis Toggles
  const [showGasHeatmap, setShowGasHeatmap] = useState(true);
  const [showSafetyBuffer, setShowSafetyBuffer] = useState(true);
  const [showMinePolygon, setShowMinePolygon] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measureDistance, setMeasureDistance] = useState(null);

  // Live GPS Cursor Coordinates Tracker
  const [cursorCoords, setCursorCoords] = useState(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const isHindi = language === 'hi';

  // Synchronized Mines Dataset with Single Source of Truth Risk Scoring
  const displayMines = useMemo(() => {
    if (!mines || mines.length === 0) return [];

    return mines.map((m) => {
      let lat = null;
      let lng = null;
      let polygon = null;

      if (m.geoBoundary) {
        if (m.geoBoundary.type === 'Polygon' && Array.isArray(m.geoBoundary.coordinates?.[0])) {
          polygon = m.geoBoundary.coordinates[0].map(([lon, la]) => [la, lon]);
          lat = polygon[0][0];
          lng = polygon[0][1];
        } else if (typeof m.geoBoundary.lat === 'number' && typeof m.geoBoundary.lng === 'number') {
          lat = m.geoBoundary.lat;
          lng = m.geoBoundary.lng;
        }
      }

      if (lat === null && typeof m.latitude === 'number') {
        lat = m.latitude;
        lng = m.longitude;
      }

      // Default fallback coordinates if missing
      if (lat === null || lng === null) {
        lat = 23.75;
        lng = 86.41;
      }

      // Single Source of Truth Risk Score & Gas Telemetry
      const tel = getMineTelemetry(m, language);
      let score = tel.riskScore;
      let band = tel.riskBand;
      let violations = band === 'HIGH' ? 3 : band === 'MEDIUM' ? 1 : 0;

      // If live score from backend prop exists, use it
      if (Array.isArray(riskScores) && riskScores.length > 0) {
        const found = riskScores.find(r => (r.mineId === m.id || r.id === m.id || r.mineName === m.name));
        if (found && typeof found.score === 'number') {
          score = found.score;
          band = found.band || tel.riskBand;
          violations = found.violations ?? violations;
        }
      } else if (riskScores && typeof riskScores === 'object' && riskScores[m.id]) {
        score = riskScores[m.id].score ?? score;
        band = riskScores[m.id].band ?? band;
        violations = riskScores[m.id].violations ?? violations;
      }

      return {
        id: m.id,
        name: m.name,
        code: m.code || 'MINE',
        subsidiary: m.subsidiary || m.company?.code || 'CIL',
        state: m.state || '',
        district: m.district || '',
        lat,
        lng,
        score,
        band,
        methane: tel.methane,
        coPpm: tel.coPpm,
        dust: tel.dust,
        workersOnShift: tel.workersOnShift,
        depth: tel.depth,
        depthStr: tel.depthStr,
        lastSurvey: tel.lastSurvey,
        lastSurveyType: tel.lastSurveyType,
        gassiness: tel.gassiness,
        location: m.location || `${m.district ? m.district + ', ' : ''}${m.state || 'Operational Zone'}`,
        violations,
        satelliteChangeDetected: score >= 65,
        polygon,
        strataLayers: tel.strataLayers,
        pitBenchCount: tel.pitBenchCount,
        seamThickness: tel.seamThickness,
      };
    });
  }, [mines, riskScores, language]);

  // Active Mine Reference
  const activeFocusMine = useMemo(() => {
    if (!displayMines || displayMines.length === 0) {
      const tel = getMineTelemetry(null, language);
      return {
        id: 'bccl-jha-blk4',
        lat: 23.7507,
        lng: 86.4158,
        name: 'Jharia Block-4 OCP',
        code: 'BCCL-JHA-BLK4',
        score: 72,
        band: 'HIGH',
        subsidiary: 'BCCL',
        state: 'Jharkhand',
        district: 'Dhanbad',
        methane: '0.42%',
        coPpm: '5.2 ppm',
        workersOnShift: tel.workersOnShift,
        depth: tel.depth,
        depthStr: tel.depthStr,
        lastSurvey: tel.lastSurvey,
        lastSurveyType: tel.lastSurveyType,
        strataLayers: tel.strataLayers,
      };
    }
    if (!selectedMineId) return displayMines[0];

    const match = displayMines.find((m) => 
      m.id === selectedMineId || 
      m.name?.toLowerCase() === String(selectedMineId).toLowerCase() ||
      m.code?.toLowerCase() === String(selectedMineId).toLowerCase() ||
      (m.name && String(selectedMineId).toLowerCase().includes(m.name.toLowerCase())) ||
      (m.name && m.name.toLowerCase().includes(String(selectedMineId).toLowerCase()))
    );

    return match || displayMines[0];
  }, [displayMines, selectedMineId, language]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = [activeFocusMine.lat, activeFocusMine.lng];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      const layer = L.tileLayer(TILE_LAYERS[mapMode] || TILE_LAYERS.GOOGLE_HYBRID, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3', 'a', 'b', 'c', 's'],
      }).addTo(map);

      // Track cursor GPS coordinates
      map.on('mousemove', (e) => {
        setCursorCoords({
          lat: e.latlng.lat.toFixed(5),
          lng: e.latlng.lng.toFixed(5),
        });
      });

      // Handle Distance Measurement Click
      map.on('click', (e) => {
        if (!measureMode) return;
        setMeasurePoints((prev) => {
          const next = [...prev, [e.latlng.lat, e.latlng.lng]];
          if (next.length === 2) {
            const d = map.distance(next[0], next[1]) / 1000;
            setMeasureDistance(d.toFixed(2));
          } else if (next.length > 2) {
            setMeasureDistance(null);
            return [[e.latlng.lat, e.latlng.lng]];
          }
          return next;
        });
      });

      tileLayerRef.current = layer;
      mapInstanceRef.current = map;
    }

    // Switch Tile Layer if mapMode changed
    if (tileLayerRef.current && mapInstanceRef.current) {
      tileLayerRef.current.setUrl(TILE_LAYERS[mapMode] || TILE_LAYERS.GOOGLE_HYBRID);
    }

    const map = mapInstanceRef.current;

    // Clear existing dynamic layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon || layer instanceof L.Circle || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const filtered =
      filterBand === 'ALL'
        ? displayMines
        : filterBand === 'HIGH'
        ? displayMines.filter((m) => m.band === 'HIGH' || m.band === 'CRITICAL')
        : displayMines.filter((m) => m.band === 'LOW' || m.band === 'MEDIUM');

    // Render Markers & Overlays
    filtered.forEach((mine) => {
      const isSelected = Boolean(activeFocusMine && (mine.id === activeFocusMine.id || mine.name === activeFocusMine.name || mine.code === activeFocusMine.code));
      const color =
        mine.band === 'CRITICAL'
          ? '#ef4444'
          : mine.band === 'HIGH'
          ? '#ea580c'
          : mine.band === 'MEDIUM'
          ? '#d97706'
          : '#16a34a';

      // 1. Gas Plume / Risk Heatmap Overlay (500m gradient circle)
      if (showGasHeatmap && (isSelected || mine.score >= 50)) {
        L.circle([mine.lat, mine.lng], {
          radius: isSelected ? 700 : 450,
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.22 : 0.12,
          weight: isSelected ? 2 : 1,
          dashArray: '4, 6',
        }).addTo(map);
      }

      // 2. DGMS Statutory 500m Safety Buffer Geofence
      if (showSafetyBuffer && isSelected) {
        L.circle([mine.lat, mine.lng], {
          radius: 500,
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.08,
          weight: 2,
        }).addTo(map);
      }

      // 3. Custom Pulsing SVG Marker Pin with EXACT Synchronized Risk Score
      const customIcon = L.divIcon({
        className: 'custom-mine-pin',
        html: `
          <div style="
            background: ${isSelected ? 'radial-gradient(circle, #2563eb 0%, #1e40af 100%)' : color};
            width: ${isSelected ? '38px' : '26px'};
            height: ${isSelected ? '38px' : '26px'};
            border-radius: 50%;
            border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
            box-shadow: 0 0 ${isSelected ? '20px #2563eb' : '8px ' + color};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: 800;
            cursor: pointer;
            position: relative;
            transform: translate(-50%, -50%);
            transition: all 0.2s ease;
          ">
            ${mine.score}
            ${mine.satelliteChangeDetected ? '<span style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;background:#38bdf8;border-radius:50%;border:2px solid #fff;" title="Satellite Strata Change Alert"></span>' : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([mine.lat, mine.lng], { icon: customIcon }).addTo(map);

      // Google Maps Direct Link
      const googleMapsUrl = `https://www.google.com/maps?q=${mine.lat},${mine.lng}`;
      const googleEarthUrl = `https://earth.google.com/web/search/${mine.lat},${mine.lng}`;

      // Rich Interactive Popup
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.45; min-width: 240px; color: #0f172a;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <strong style="font-size: 13.5px; color: #0f172a;">${mine.name}</strong>
            <span style="font-size: 10px; font-weight: 800; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${mine.subsidiary}</span>
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${mine.location} · <code>${mine.code}</code></div>
          
          <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px; margin-bottom: 6px;">
            <div><strong>${isHindi ? 'जोखिम स्कोर:' : 'Risk Score:'}</strong> <span style="color: ${color}; font-weight: 800;">${mine.score}/100</span></div>
            <div><strong>${isHindi ? 'बैंड:' : 'Band:'}</strong> <span style="font-weight: 700; color: ${color};">${mine.band}</span></div>
            <div><strong>${isHindi ? 'पाली में श्रमिक:' : 'On Shift:'}</strong> <span style="font-weight: 700;">${mine.workersOnShift}</span></div>
            <div><strong>${isHindi ? 'गहराई:' : 'Depth:'}</strong> <span style="font-weight: 700;">${mine.depthStr}</span></div>
            <div><strong>CH₄:</strong> ${mine.methane}</div>
            <div><strong>CO:</strong> ${mine.coPpm}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 8px; border-radius: 6px; font-size: 10px; color: #475569; margin-bottom: 8px;">
            📅 <strong>${isHindi ? 'अंतिम सर्वेक्षण:' : 'Last Survey:'}</strong> ${mine.lastSurvey}<br/>
            📍 Lat: ${mine.lat.toFixed(5)}°, Lng: ${mine.lng.toFixed(5)}°
          </div>

          <div style="display: flex; gap: 6px;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #2563eb; color: #fff; padding: 5px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; text-decoration: none;">
              🗺️ Google Maps
            </a>
            <a href="${googleEarthUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0f172a; color: #fff; padding: 5px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; text-decoration: none;">
              🌍 3D Earth
            </a>
          </div>
        </div>
      `);

      if (isSelected) {
        setTimeout(() => {
          try {
            marker.openPopup();
          } catch (e) {}
        }, 120);
      }

      marker.on('click', () => {
        if (onSelectMine) onSelectMine(mine.id);
        map.flyTo([mine.lat, mine.lng], 13, { animate: true, duration: 0.5 });
      });

      // Draw Polygon Boundary if present
      if (mine.polygon && showMinePolygon) {
        L.polygon(mine.polygon, {
          color: isSelected ? '#2563eb' : color,
          weight: isSelected ? 3 : 1.5,
          fillColor: isSelected ? '#2563eb' : color,
          fillOpacity: isSelected ? 0.28 : 0.1,
          dashArray: isSelected ? null : '4, 4',
        }).addTo(map);
      }
    });

    // Draw Measurement Polyline
    if (measurePoints.length === 2) {
      L.polyline(measurePoints, {
        color: '#f43f5e',
        weight: 3,
        dashArray: '6, 6',
      }).addTo(map);
    }
  }, [displayMines, filterBand, selectedMineId, language, mapMode, showGasHeatmap, showSafetyBuffer, showMinePolygon, measurePoints, onSelectMine, activeFocusMine]);

  // Quick-response Camera Focus to Selected Mine
  useEffect(() => {
    if (mapInstanceRef.current && activeFocusMine && typeof activeFocusMine.lat === 'number' && typeof activeFocusMine.lng === 'number') {
      mapInstanceRef.current.flyTo([activeFocusMine.lat, activeFocusMine.lng], 13, {
        animate: true,
        duration: 0.4,
      });
    }
  }, [activeFocusMine]);

  // Center camera on target active mine
  const handleCenterActiveMine = () => {
    if (mapInstanceRef.current && activeFocusMine) {
      mapInstanceRef.current.flyTo([activeFocusMine.lat, activeFocusMine.lng], 13, {
        animate: true,
        duration: 0.6,
      });
    }
  };

  const handlePanIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.8, 82.8], 5, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  const handleCopyCoordinates = () => {
    if (activeFocusMine) {
      const str = `${activeFocusMine.lat.toFixed(5)}, ${activeFocusMine.lng.toFixed(5)}`;
      navigator.clipboard.writeText(str);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gesso-divider)', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)', background: '#f8fafc' }}>
      {/* ── Top Bar: Mode Switcher (Map Satellite vs 3D Geological Cutaway) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '10px 14px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setViewTab('MAP')}
            style={{
              background: viewTab === 'MAP' ? '#2563eb' : '#f1f5f9',
              color: viewTab === 'MAP' ? '#ffffff' : '#1e293b',
              border: viewTab === 'MAP' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
              borderRadius: 7,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            🛰️ {isHindi ? 'उपग्रह एवं जीआईएस मानचित्र' : 'Satellite & GIS Map'}
          </button>

          <button
            type="button"
            onClick={() => setViewTab('3D_GEOLOGY')}
            style={{
              background: viewTab === '3D_GEOLOGY' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#f1f5f9',
              color: viewTab === '3D_GEOLOGY' ? '#ffffff' : '#4338ca',
              border: viewTab === '3D_GEOLOGY' ? '1px solid #4338ca' : '1px solid #c7d2fe',
              borderRadius: 7,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: viewTab === '3D_GEOLOGY' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            🧊 {isHindi ? '3D भूगर्भीय स्ट्रैटम एवं पिट मॉडल' : '3D Geological Stratum & Pit Model'}
          </button>
        </div>

        {/* Selected Mine Live Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#0369a1' }}>
            <span>📍</span> {activeFocusMine.name} ({activeFocusMine.subsidiary})
          </span>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            {activeFocusMine.depthStr} · {activeFocusMine.workersOnShift} {isHindi ? 'श्रमिक' : 'Workers'}
          </span>
        </div>
      </div>

      {viewTab === 'MAP' ? (
        <div style={{ position: 'relative', width: '100%', minHeight: '480px' }}>
          {/* ── Top Floating Basemap Toolbar ── */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 6, flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)', padding: '6px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <button
              type="button"
              onClick={() => setMapMode('GOOGLE_HYBRID')}
              style={{
                background: mapMode === 'GOOGLE_HYBRID' ? '#2563eb' : '#f1f5f9',
                color: mapMode === 'GOOGLE_HYBRID' ? '#ffffff' : '#1e293b',
                border: mapMode === 'GOOGLE_HYBRID' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Google Satellite Hybrid with Roads & Labels"
            >
              🌐 {isHindi ? 'गूगल सैटेलाइट' : 'Google Satellite'}
            </button>

            <button
              type="button"
              onClick={() => setMapMode('GOOGLE_TERRAIN')}
              style={{
                background: mapMode === 'GOOGLE_TERRAIN' ? '#2563eb' : '#f1f5f9',
                color: mapMode === 'GOOGLE_TERRAIN' ? '#ffffff' : '#1e293b',
                border: mapMode === 'GOOGLE_TERRAIN' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Google Terrain with 3D Hillshading"
            >
              🏔️ {isHindi ? 'गूगल टेरेन (3D)' : 'Google Terrain (3D)'}
            </button>

            <button
              type="button"
              onClick={() => setMapMode('ESRI_SATELLITE')}
              style={{
                background: mapMode === 'ESRI_SATELLITE' ? '#2563eb' : '#f1f5f9',
                color: mapMode === 'ESRI_SATELLITE' ? '#ffffff' : '#1e293b',
                border: mapMode === 'ESRI_SATELLITE' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="ESRI High-Resolution Earth Imagery"
            >
              🛰️ {isHindi ? 'ESRI सैटेलाइट' : 'ESRI Imagery'}
            </button>

            <button
              type="button"
              onClick={() => setMapMode('CARTO_LIGHT')}
              style={{
                background: mapMode === 'CARTO_LIGHT' ? '#2563eb' : '#f1f5f9',
                color: mapMode === 'CARTO_LIGHT' ? '#ffffff' : '#1e293b',
                border: mapMode === 'CARTO_LIGHT' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Clean Light Vector Map"
            >
              🗺️ {isHindi ? 'वेक्टर मैप' : 'Vector Map'}
            </button>

            {/* 3D Oblique Perspective Toggle */}
            <button
              type="button"
              onClick={() => setIs3DView(!is3DView)}
              style={{
                background: is3DView ? '#4f46e5' : '#f8fafc',
                color: is3DView ? '#ffffff' : '#4338ca',
                border: is3DView ? '1px solid #4338ca' : '1px solid #c7d2fe',
                borderRadius: 6,
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Toggle 3D Oblique Perspective View"
            >
              📐 {is3DView ? (isHindi ? '3D झुकाव (चालू)' : '3D Tilt (ON)') : (isHindi ? '3D परिप्रेक्ष्य' : '3D Tilt')}
            </button>
          </div>

          {/* ── Top Right Quick Actions (Focus, Pan-India, Gas Plume, Buffer) ── */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCenterActiveMine}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: '1px solid #1d4ed8',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}
              title="Center on Active Selected Mine"
            >
              🎯 {isHindi ? 'सक्रिय खदान' : 'Focus Mine'}
            </button>

            <button
              type="button"
              onClick={handlePanIndiaView}
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Pan India Grid View"
            >
              🇮🇳 {isHindi ? 'अखिल भारतीय' : 'Pan-India'}
            </button>

            <button
              type="button"
              onClick={() => setShowGasHeatmap(!showGasHeatmap)}
              style={{
                background: showGasHeatmap ? '#ea580c' : 'rgba(255, 255, 255, 0.96)',
                color: showGasHeatmap ? '#ffffff' : '#1e293b',
                border: showGasHeatmap ? '1px solid #c2410c' : '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Toggle Gas & Strata Dispersion Heatmap"
            >
              🔥 {isHindi ? 'गैस प्लूम' : 'Gas Plume'}
            </button>

            <button
              type="button"
              onClick={() => setShowSafetyBuffer(!showSafetyBuffer)}
              style={{
                background: showSafetyBuffer ? '#0284c7' : 'rgba(255, 255, 255, 0.96)',
                color: showSafetyBuffer ? '#ffffff' : '#1e293b',
                border: showSafetyBuffer ? '1px solid #0369a1' : '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="DGMS Statutory 500m Safety Buffer Geofence"
            >
              🛡️ {isHindi ? '500m सुरक्षा घेरा' : '500m Buffer'}
            </button>
          </div>

          {/* 3D Tilt Slider Controls (when 3D tilt active) */}
          {is3DView && (
            <div style={{ position: 'absolute', top: 58, left: 12, zIndex: 1000, background: 'rgba(15, 23, 42, 0.92)', color: '#ffffff', padding: '6px 12px', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <span>📐 {isHindi ? 'झुकाव कोण:' : 'Tilt Angle:'} <b>{tiltAngle}°</b></span>
              <input
                type="range"
                min="0"
                max="55"
                value={tiltAngle}
                onChange={(e) => setTiltAngle(Number(e.target.value))}
                style={{ width: 80, accentColor: '#38bdf8', cursor: 'pointer' }}
              />
              <button
                type="button"
                onClick={() => setTiltAngle(32)}
                style={{ background: '#334155', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          )}

          {/* ── Real-Time Google Maps & GPS Coordinates HUD Overlay (Bottom Left) ── */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'rgba(255, 255, 255, 0.96)', color: '#0f172a', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 11.5, maxWidth: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontWeight: 800, color: '#0284c7', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>📍</span>
                <span>{activeFocusMine.name}</span>
              </div>
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                {activeFocusMine.subsidiary} · {activeFocusMine.state}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, color: '#475569', margin: '4px 0 6px' }}>
              <div>👥 <b>{isHindi ? 'श्रमिक:' : 'Workers:'}</b> {activeFocusMine.workersOnShift}</div>
              <div>⛏️ <b>{isHindi ? 'गहराई:' : 'Depth:'}</b> {activeFocusMine.depthStr}</div>
              <div>📅 <b>{isHindi ? 'सर्वेक्षण:' : 'Survey:'}</b> {activeFocusMine.lastSurvey}</div>
              <div>🚨 <b>{isHindi ? 'जोखिम:' : 'Risk:'}</b> <span style={{ color: activeFocusMine.score >= 70 ? '#ea580c' : '#16a34a', fontWeight: 800 }}>{activeFocusMine.score}/100</span></div>
            </div>

            <div style={{ fontFamily: 'var(--gesso-font-mono, monospace)', fontSize: 10.5, color: '#64748b', marginBottom: 6 }}>
              GPS: <b>{activeFocusMine.lat?.toFixed(5)}°N, {activeFocusMine.lng?.toFixed(5)}°E</b>
              {cursorCoords && (
                <span style={{ color: '#0369a1', marginLeft: 6 }}>
                  (Cursor: {cursorCoords.lat}, {cursorCoords.lng})
                </span>
              )}
            </div>

            {/* Action Buttons for Google Maps & 3D Earth */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <a
                href={`https://www.google.com/maps?q=${activeFocusMine.lat},${activeFocusMine.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                🗺️ Google Maps
              </a>

              <a
                href={`https://earth.google.com/web/search/${activeFocusMine.lat},${activeFocusMine.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                🌍 Google Earth 3D
              </a>

              <button
                type="button"
                onClick={handleCopyCoordinates}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Copy GPS Coordinates"
              >
                {copiedCoords ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* ── Leaflet Map Container with 3D Perspective Tilt ── */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '490px',
              background: '#e2e8f0',
              transform: is3DView ? `perspective(900px) rotateX(${tiltAngle}deg) scale(1.04)` : 'none',
              transformOrigin: 'center 75%',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      ) : (
        /* ── 3D GEOLOGICAL STRATUM & PIT DEPTH CUTAWAY MODEL ── */
        <div style={{ padding: '20px', background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)', color: '#ffffff', minHeight: '480px' }}>
          {/* Header of 3D Cutaway */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⛏️</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>
                  {isHindi ? `${activeFocusMine.name} — 3D भूगर्भीय स्ट्रैटम एवं उत्खनन प्रोफ़ाइल` : `${activeFocusMine.name} — 3D Geological Stratum & Bench Cutaway Profile`}
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                {isHindi
                  ? `DGMS वैधानिक अभिलेखों के अनुसार कुल गहराई: ${activeFocusMine.depthStr} · पाली में सक्रिय कर्मी: ${activeFocusMine.workersOnShift} · गैस स्तर: ${activeFocusMine.methane}`
                  : `DGMS statutory records depth: ${activeFocusMine.depthStr} · Active workforce on shift: ${activeFocusMine.workersOnShift} personnel · Gas CH₄: ${activeFocusMine.methane}`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
                {activeFocusMine.lastSurveyType || 'DGMS Survey'}
              </span>
              <a
                href={`https://earth.google.com/web/search/${activeFocusMine.lat},${activeFocusMine.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}
              >
                🌍 {isHindi ? 'Google Earth 3D खोलें' : 'Launch Google Earth 3D'}
              </a>
            </div>
          </div>

          {/* Interactive 3D Stratum Cutaway Graphic */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 280px', gap: 20, alignItems: 'center' }}>
            {/* 3D Isometric SVG Cutaway */}
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
              <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="coalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#090d16" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                  <linearGradient id="soilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#854d0e" />
                    <stop offset="100%" stopColor="#a16207" />
                  </linearGradient>
                </defs>

                {/* Sky & Surface Level */}
                <rect x="20" y="20" width="560" height="40" rx="6" fill="url(#skyGrad)" />
                <text x="35" y="44" fill="#38bdf8" fontSize="12" fontWeight="700">
                  📍 {isHindi ? 'सतह (0 m RL) — मुख्य ढुलाई पोर्टल एवं प्रशासनिक भवन' : 'Surface (0 m RL) — Main Haulage Portal & Admin Complex'}
                </text>

                {/* Strata Layer 1: Topsoil / Overburden (0m to 25m) */}
                <polygon points="40,70 540,70 520,110 60,110" fill="url(#soilGrad)" opacity="0.85" />
                <text x="70" y="95" fill="#fef08a" fontSize="11" fontWeight="700">
                  {activeFocusMine.strataLayers?.[0]?.name || 'Surface Overburden (0m - 25m)'}
                </text>

                {/* Strata Layer 2: Sandstone / Middle Benches (25m to 90m) */}
                <polygon points="60,115 520,115 500,175 80,175" fill="url(#rockGrad)" opacity="0.85" />
                <text x="90" y="148" fill="#e2e8f0" fontSize="11" fontWeight="700">
                  {activeFocusMine.strataLayers?.[1]?.name || 'Middle Overburden Benches (25m - 90m)'}
                </text>

                {/* Strata Layer 3: Main Active Working Seam (90m to Depth) */}
                <polygon points="80,180 500,180 470,250 110,250" fill="url(#coalGrad)" stroke="#f59e0b" strokeWidth="2" />
                <text x="120" y="218" fill="#fbbf24" fontSize="12" fontWeight="800">
                  ⚡ {activeFocusMine.strataLayers?.[2]?.name || `Main Working Coal Seam (${activeFocusMine.depthStr})`}
                </text>

                {/* Strata Layer 4: Floor & Sump (Bottom) */}
                <polygon points="110,255 470,255 450,295 130,295" fill="#020617" stroke="#334155" />
                <text x="145" y="280" fill="#94a3b8" fontSize="10" fontWeight="600">
                  {activeFocusMine.strataLayers?.[3]?.name || 'Basement Floor & Water Drainage Sump'}
                </text>

                {/* Depth Meter Ruler on Left */}
                <line x1="25" y1="65" x2="25" y2="295" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="25" cy="70" r="3" fill="#38bdf8" />
                <text x="5" y="74" fill="#38bdf8" fontSize="9" fontWeight="700">0m</text>
                <circle cx="25" cy="180" r="3" fill="#fbbf24" />
                <text x="2" y="184" fill="#fbbf24" fontSize="9" fontWeight="700">{Math.round(activeFocusMine.depth * 0.65)}m</text>
                <circle cx="25" cy="290" r="3" fill="#f43f5e" />
                <text x="0" y="294" fill="#f43f5e" fontSize="9" fontWeight="800">{activeFocusMine.depthStr}</text>

                {/* Live Worker & Sensor Beacons */}
                <g fill="#22c55e">
                  <circle cx="220" cy="210" r="6" />
                  <circle cx="220" cy="210" r="12" opacity="0.3" />
                  <circle cx="340" cy="215" r="6" />
                  <circle cx="340" cy="215" r="12" opacity="0.3" />
                </g>
                <g fill="#38bdf8">
                  <circle cx="180" cy="140" r="5" />
                  <circle cx="410" cy="145" r="5" />
                </g>
                <text x="235" y="214" fill="#22c55e" fontSize="10" fontWeight="700">
                  {activeFocusMine.workersOnShift} {isHindi ? 'सक्रिय कामगार' : 'Shift Workers'}
                </text>
              </svg>
            </div>

            {/* Depth & Telemetry Summary Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{isHindi ? 'अधिकतम उत्खनन गहराई' : 'Maximum Statutory Depth'}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{activeFocusMine.depthStr}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {isHindi ? `सीम मोटाई: ${activeFocusMine.seamThickness || '6.5 m'}` : `Seam Thickness: ${activeFocusMine.seamThickness || '6.5 m'}`}
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{isHindi ? 'पाली में कार्यरत श्रमिक संख्या' : 'Shift Workforce Deployment'}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 2 }}>{activeFocusMine.workersOnShift}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {isHindi ? 'पाली-1 (4 कार्य दल)' : 'Shift-1 · 4 Active Working Crews'}
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{isHindi ? 'अंतिम वैधानिक सर्वेक्षण' : 'Last Statutory Survey'}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>{activeFocusMine.lastSurvey}</div>
                <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>
                  {activeFocusMine.lastSurveyType}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

