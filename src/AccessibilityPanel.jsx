import React, { useState, useEffect, useRef } from 'react';

export default function AccessibilityPanel({ 
  colorBlindMode, 
  setColorBlindMode, 
  activeLayerId, 
  selectedDate,
  showSubtitles,
  setShowSubtitles,
  setSubtitleText,
  autoSpeak,
  setAutoSpeak,
  isOpen,
  setIsOpen,
  language,
  setLanguage,
  fontSize,
  setFontSize
}) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [theme, setTheme] = useState('default')
  const subtitleTimerRef = useRef(null)

  
  const layerDictionary = {
    'MODIS_Terra_CorrectedReflectance_TrueColor': { id: 'Warna Asli', en: 'True Color' },
    'MODIS_Terra_CorrectedReflectance_Bands367': { id: 'Warna Semu', en: 'False Color' },
  };
  
  const currentLayerName = layerDictionary[activeLayerId]?.[language] || activeLayerId;

  const translations = {
    id: {
      title: "♿ Aksesibilitas",
      langToggle: "Bahasa / Language",
      colorBlind: "FILTER BUTA WARNA",
      normal: "Normal",
      protanopia: "Protanopia (Buta Merah)",
      deuteranopia: "Deuteranopia (Buta Hijau)",
      tritanopia: "Tritanopia (Buta Biru)",
      grayscale: "Grayscale (Hitam Putih)",
      voiceSelect: "PILIH SUARA (TTS)",
      subtitles: "TAMPILKAN SUBTITLE",
      speakBtn: "🔊 Bacakan Informasi Peta",
      ttsText: `Menampilkan peta satelit NASA. Layer aktif: ${currentLayerName}, tanggal: ${selectedDate}.`,
      autoSpeakLabel: 'suara otomatis'
    },
    en: {
      title: "♿ Accessibility",
      langToggle: "Language / Bahasa",
      colorBlind: "COLORBLIND FILTER",
      normal: "Normal",
      protanopia: "Protanopia (Red-Blind)",
      deuteranopia: "Deuteranopia (Green-Blind)",
      tritanopia: "Tritanopia (Blue-Blind)",
      grayscale: "Grayscale",
      voiceSelect: "SELECT VOICE (TTS)",
      subtitles: "SHOW SUBTITLES",
      speakBtn: "🔊 Read Map Information",
      ttsText: `Showing NASA satellite map. Active layer: ${currentLayerName}, date: ${selectedDate}.`,
      autoSpeakLabel: 'auto audio'
    }
  };
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme])

  const t = translations[language];


  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

       const filtered = voices.filter(v => {
        const langCode = (v.lang || '').toLocaleLowerCase();
        if (language === 'id') {
          return langCode.startsWith('id') || langCode.startsWith('in');
        }
        return langCode.startsWith('en')
       });

       let voiceList = filtered;
       if (language === 'en' && filtered.length > 0) {
        voiceList = [filtered[0]];
       } else if (filtered.length === 0) {
        voiceList =  voices;
       }
        
        setAvailableVoices(voiceList);
        setSelectedVoiceIndex(0)
      }
    };

    updateVoices();
   if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  return () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = null;
    }
  };
}, [language]);

  const speakStatus = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      
      if (subtitleTimerRef.current) {
        clearTimeout(subtitleTimerRef.current)
      }

      const textToSpeak = t.ttsText;

      if (showSubtitles) {
        setSubtitleText(textToSpeak);
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
      utterance.rate = 0.85;

      if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
        utterance.voice = availableVoices[selectedVoiceIndex];
      }

      utterance.onend = () => {
        subtitleTimerRef.current = setTimeout(() => setSubtitleText(''), 3000);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert(language === 'id' ? "Browser Anda tidak mendukung Text-to-Speech." : "Your browser does not support Text-to-Speech.");
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="panel-toggle-btn" 
        onClick={() => setIsOpen(true)}
        style={{ top: '10px', right: '10px' }}
      >
        ♿ Aksesibilitas
      </button>
    );
  }

  return (
    <aside className="glass-panel" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, width: '290px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          {t.title}
        </h2>

        <button 
          onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid var(--accent)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
          aria-label="Ganti Bahasa"
        >
          {language === 'id' ? 'ID' : 'EN'}
        </button>
        <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
          >
            ✕
          </button>
      </header>

      <div className='accessibility-group'>
          <label>Ukuran Text</label>
          <div className='btn-toggle-group'>
            <button className={fontSize === 'normal' ? 'active' : ''} onClick={() => setFontSize('normal')}>A</button>
            <button className={fontSize === 'large' ? 'active' : ''} onClick={() => setFontSize('large')}>A+</button>
            <button className={fontSize === 'xlarge' ? 'active' : ''} onClick={() => setFontSize('xlarge')}>A++</button>
          </div>

          <label style={{ marginTop: '12px', display: 'block' }}>Tema Antarmuka:</label>
          <div className="btn-toggle-group">
            <button className={theme === 'default' ? 'active' : ''} onClick={() => setTheme('default')}>Default</button>
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
          </div>
        </div>


      <section style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block' }}>
          {t.colorBlind}
        </label>
        <select 
          className="modern-select" 
          value={colorBlindMode}
          onChange={(e) => setColorBlindMode(e.target.value)}
        >
          <option value="filter-normal">{t.normal}</option>
          <option value="filter-protanopia">{t.protanopia}</option>
          <option value="filter-deuteranopia">{t.deuteranopia}</option>
          <option value="filter-tritanopia">{t.tritanopia}</option>
          <option value="filter-grayscale">{t.grayscale}</option>
        </select>
      </section>

      <section style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor='autospeak-toggle' style={{fontSize: '12px', fontWeight: '600', color: '#94a3b8'}}>
          🔊 {t.autoSpeakLabel}
        </label>
        <input 
        id='autospeak-toggle'
        type='checkbox'
        checked={autoSpeak}
        onChange= {(e) => setAutoSpeak(e.target.checked)}
        style={{ width: '18px', height: '18px', cursor: 'pointer'}}
        />
      </section>

      <section style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block' }}>
          {t.voiceSelect}
        </label>
        <select 
          className="modern-select"
          value={selectedVoiceIndex}
          onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
        >
          {availableVoices.map((voice, idx) => (
            <option key={idx} value={idx}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </section>

      <section style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor="subtitle-toggle" style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
          {t.subtitles}
        </label>
        <input 
          id="subtitle-toggle"
          type="checkbox"
          checked={showSubtitles}
          onChange={(e) => setShowSubtitles(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      </section>

      <button className="btn-action" onClick={speakStatus}>
        {t.speakBtn}
      </button>
    </aside>
  );
}