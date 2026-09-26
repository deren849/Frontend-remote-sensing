import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import RemoteSensingPanel from './RemoteSensingPanel';
import AccessibilityPanel from './AccessibilityPanel';
import SpaceDashboard from './SpaceDashboard';
import SearchBar from './SearchBar';
import DistanceMeasure from './DistanceMeasure';
import LandingPage from './LandingPage';
import 'leaflet/dist/leaflet.css';
import './App.css';


function EonetLayer({ events, autoSpeak, language, speakText }) {
  const map = useMapEvents({});
  const [bounds, setBounds] = useState(() => map.getBounds());
  
  useEffect(() => {
    const handleMapChange = () => setBounds(map.getBounds());
    map.on('moveend zoomend', handleMapChange);
    return () => {
      map.off('moveend zoomend', handleMapChange);
    };
  }, [map]);

  return events.map(event => {
    const geom = event.geometry[0];
    if (!geom || geom.type?.toLowerCase() !== 'point'|| !Array.isArray(geom.coordinates)) return null;

    const [lng, lat] = geom.coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    const latLng = [lat, lng];
    if (!bounds.contains(latLng)) return null;
   

    return (
      <CircleMarker 
        key={event.id}
        center={latLng} 
        radius={7}
        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}
        eventHandlers={{
          click: () => {
          if (autoSpeak) {
          const prefix = language === 'en' ? 'Disaster alert' : 'Peringatan bencana';
          speakText(`${prefix} ${event.title}`, true); 
          }
        }
      }}
      >
        <Popup><strong style={{ color: '#ef4444' }}>{event.title}</strong></Popup>
      </CircleMarker>
    );
  });
}


function MapKeyboardControls() {
  const map = useMap();
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(targetTag)) {
        return;
      }
      const panStep = 120;
      const options = { animate: true, duration: 0.25};

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          map.panBy([0, -panStep], options);
          break
        case 's':
        case 'arrowdown':
          map.panBy([0, panStep], options);
          break;
        case 'a':
        case 'arrowleft':
          map.panBy([-panStep, 0], options);
          break;
        case 'd':
        case 'arrowright':
          map.panBy([panStep, 0], options);
          break;
        case '+':
        case '=':
          map.zoomIn();
          break;
        case '-':
        case '_':
          map.zoomOut();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [map]);
  return null; 
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeLayer, setActiveLayer] = useState('MODIS_Terra_CorrectedReflectance_TrueColor');
  const [colorBlindMode, setColorBlindMode] = useState('filter-normal');
  const [layerOpacity, setLayerOpacity] = useState(0.85);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleText, setSubtitleText] = useState('');
  const [showEonet, setShowEonet] = useState(false);
  const [EonetEvents, setEonetEvents] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isRemoteOpen, setIsRemoteOpen] = useState(true);
  const [isAccessOpen, setIsAccessOpen] = useState(true);
  const [isNeoWsOpen, setIsNeoWsOpen] = useState(true);
  const [language, setLanguage] = useState('id');
  const [isDistanceActive, setIsDistanceActive] = useState(false)
  const [currentView, setCurrentView] = useState('landing');
  const [eonetCategories, setEonetCategories] = useState(['wildfires', 'volcanoes', 'severeStorms'])
  const subtitleTimerRef = useRef(null);
  const [fontSize, setFontSize] = useState('normal')


  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);


  useEffect (() => {
    if (!selectedDate) return;

    const rawBackendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const backendUrl = rawBackendUrl.replace(/\/$/, '');

    const controller = new AbortController();

    fetch(`${backendUrl}/api/check-date/${selectedDate}`, {
    signal: controller.signal
  })


  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    if (data.status === 'not_available') {
      console.warn(`[Backend Check] Citra NASA belum tersedia untuk tanggal: ${selectedDate}`);
    } else {
      console.log(`[Backend Check] Citra NASA siap untuk tanggal: ${selectedDate}`);
    }
  })
  .catch((err) => {
    if (err.name !== 'AbortError') {
      console.error(`[Backend Check Error]:`, err.message);
    }
  });

  return () => controller.abort();
  }, [selectedDate]);


  useEffect(() => {
    const controller = new AbortController();
    document.title = "Web GIS - Remote Sensing & Accessibility";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Aplikasi Web GIS Penginderaan Jauh NASA Worldview interaktif dengan dukungan fitur aksesibilitas penuh untuk semua pengguna.';
  
    if (showEonet && eonetCategories.length > 0) {
      const categoriesparam = eonetCategories.join(',');
      fetch(`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=1000&category=${categoriesparam}`, {
        signal: controller.signal
      })
          .then(res => res.json())
          .then(data => setEonetEvents(data.events || []))
          .catch(err => {
            if (err.name !== 'AbortError') console.error(err);
          });
    } else {
      setEonetEvents([]);
    }
    return () => controller.abort();
  }, [showEonet, eonetCategories]);

  useEffect(() => {
    return () => {
      if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const getNasaTileUrl = (layerName) => {
    return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerName}/default/${selectedDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
  };

 const speakText = useCallback((text, isAuto = true) => {
  if (isAuto && !autoSpeak) {
    console.log(`[TTS Blocked]: "${text}" (autoSpeak dimatikan)`);
    return;
  }

  if (showSubtitles) {
    setSubtitleText(text);
    if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);
    subtitleTimerRef.current = setTimeout(() => setSubtitleText(''), 8000);
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
    utterance.rate = 0.9;

    console.log(`[TTS Playing] (${isAuto ? 'Auto' : 'Manual'}): "${text}"`);
    window.speechSynthesis.speak(utterance);
  }
}, [autoSpeak, showSubtitles, language]);

  
  return (
    <>
      <svg width={0} height={0} style={{ position: 'absolute', zIndex: '-1' }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0  0, 0.433, 0.567, 0, 0  0, 0.475, 0.525, 0, 0  0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      <div className={colorBlindMode} style={{ width: '100vw', height: '100vh'}}>
      {currentView === 'landing' ? (
        <LandingPage
        onLaunchMap={() => setCurrentView('map')}
        language={language}
        setLanguage={setLanguage}
        colorBlindMode={colorBlindMode}
        setColorBlindMode={setColorBlindMode}
        speakText={speakText}
        fontSize={fontSize}      
        setFontSize={setFontSize}
        />
      ) : (
      <main className="app-content" style={{ position: 'relative', width: '100vw', height: '100vh' }}>

        <RemoteSensingPanel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          layerOpacity={layerOpacity}
          onOpacityChange={setLayerOpacity}
          showEonet={showEonet}
          setShowEonet={setShowEonet}
          isOpen={isRemoteOpen}
          setIsOpen={setIsRemoteOpen}
          language={language}
          setLanguage={setLanguage}
          isDistanceActive={isDistanceActive}
          setIsDistanceActive={setIsDistanceActive}
          eonetCategories={eonetCategories}
          setEonetCategories={setEonetCategories}
        />

        <SpaceDashboard 
          selectedDate={selectedDate} 
          isOpen={isNeoWsOpen}
          setIsOpen={setIsNeoWsOpen}
          language={language}
          setLanguage={setLanguage}
          isRsOpen={isRemoteOpen}
          isAccessOpen={isAccessOpen}
        />

        <AccessibilityPanel 
          colorBlindMode={colorBlindMode}
          setColorBlindMode={setColorBlindMode}
          activeLayerId={activeLayer}
          selectedDate={selectedDate}
          showSubtitles={showSubtitles}
          setShowSubtitles={setShowSubtitles}
          setSubtitleText={setSubtitleText}
          autoSpeak={autoSpeak}
          setAutoSpeak={setAutoSpeak}
          isOpen={isAccessOpen}
          setIsOpen={setIsAccessOpen}
          language={language}
          setLanguage={setLanguage}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />

        {showSubtitles && subtitleText && (
          <div className="subtitle-banner" role="status" aria-live="polite">
            {subtitleText}
          </div>
        )}

        <div className="landscape-warning" role="alert">
        <h2>Tolong Putar Perangkat Anda</h2>
        <p>Aplikasi ini membutuhkan layar mode Lanskap (Horizontal).</p>
        </div>


        <div style={{ height: '100%', width: '100%' }}>
          <MapContainer 
            center={[0, 115]} 
            zoom={4} 
            style={{ height: '100%', width: '100%' }}
            maxBounds={[[-90, -180], [90, 180]]}
            zoomControl={false} 
          >
            <MapKeyboardControls />
            <SearchBar language={language} />

            <DistanceMeasure 
              isActive={isDistanceActive} 
              speakText={speakText} 
              language={language} 
            />

            <TileLayer
              key={`base-${selectedDate}`}
              url={getNasaTileUrl('MODIS_Terra_CorrectedReflectance_TrueColor')}
              maxNativeZoom={9}
              maxZoom={12}
            />

            {activeLayer !== 'MODIS_Terra_CorrectedReflectance_TrueColor' && (
              <TileLayer
                key={`overlay-${activeLayer}-${selectedDate}`}
                url={getNasaTileUrl(activeLayer)}
                opacity={layerOpacity}
                maxNativeZoom={9}
                maxZoom={12}
              />
            )}

            <TileLayer
              url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Boundaries_Crossed/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png" 
              maxNativeZoom={9}
              maxZoom={12}
            />

            {showEonet && (
              <EonetLayer 
                events={EonetEvents} 
                autoSpeak={autoSpeak} 
                language={language} 
                speakText={speakText} 
              />
            )}
            
            </MapContainer>
            </div>
          </main>
        )}
      </div>
    </>
  );
}