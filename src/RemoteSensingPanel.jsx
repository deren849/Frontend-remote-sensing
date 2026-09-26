import React from 'react';

export default function RemoteSensingPanel({ 
  selectedDate, 
  onDateChange, 
  activeLayer, 
  onLayerChange,
  layerOpacity,
  onOpacityChange,
  showEonet,
  setShowEonet,
  isOpen,
  setIsOpen,
  language,
  isDistanceActive,
  setIsDistanceActive,
  eonetCategories = [],
  setEonetCategories,
}) {
  const t = {
    id: {
      toggleBtn: "Remote Sensing",
      dateLabel: "TANGGAL AKUISISI DATA",
      layerLabel: "INDEKS SATELIT (LAYER)",
      trueColor: "Warna Asli (True Color)",
      falseColor: "Warna Semu (Bands 3-6-7)",
      eonetLabel: "Radar Bencana Alam (EONET)",
      opacityLabel: "TRANSPARANSI LAYER",
      distanceLabel: "PENGUKUR JARAK",
      distanceActive: "📏 Matikan Ukur Jarak",
      distanceInactive: "📏 Aktifkan Ukur Jarak"
    },
    en: {
      toggleBtn: "Remote Sensing",
      dateLabel: "DATA ACQUISITION DATE",
      layerLabel: "SATELLITE INDEX (LAYER)",
      trueColor: "True Color",
      falseColor: "False Color (Bands 3-6-7)",
      eonetLabel: "Natural Disaster Radar (EONET)",
      opacityLabel: "LAYER TRANSPARENCY",
      distanceLabel: "DISTANCE MEASURE",
      distanceActive: "📏 Stop Measuring",
      distanceInactive: "📏 Measure Distance"
    }
  }[language];

  const remoteSensingLayers = [
    { id: 'MODIS_Terra_CorrectedReflectance_TrueColor', name: t.trueColor },
    { id: 'MODIS_Terra_CorrectedReflectance_Bands367', name: t.falseColor },
  ];

  const handleCategoryToggle = (categoryId) => {
    if (eonetCategories.includes(categoryId)) {
      setEonetCategories(eonetCategories.filter(id => id !== categoryId));
    } else {
      setEonetCategories([...eonetCategories, categoryId]);
    }
  };

  const categoryOptions = [
    { id: 'wildfires', label: language === 'id' ? 'Kebakaran Hutan' : 'Wildfires' },
    { id: 'volcanoes', label: language === 'id' ? 'Gunung Berapi' : 'Volcanoes' },
    { id: 'severeStorms', label: language === 'id' ? 'Badai Ekstrem' : 'Severe Storms' },
    { id: 'icebergs', label: language === 'id' ? 'Bongkahan Es' : 'Icebergs' }
  ];

  if (!isOpen) {
    return (
      <button 
        className="panel-toggle-btn" 
        onClick={() => setIsOpen(true)}
        style={{ top: '10px', left: '10px' }}
      >
        {t.toggleBtn}
      </button>
    );
  }

  return (
    <aside className="glass-panel" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, width: '280px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Remote Sensing</h1>
        <button 
          onClick={() => setIsOpen(false)}
          className="btn-close-panel"
        >
          ✕
        </button>
      </header>

      <section style={{ marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
        <span className="section-label">{t.distanceLabel}</span>
        <button
          onClick={() => setIsDistanceActive(!isDistanceActive)}
          className="btn-action"
          style={{
            margin: 0,
            background: isDistanceActive ? '#d97706' : 'var(--card-bg)',
            color: isDistanceActive ? '#ffffff' : 'var(--text-main)',
          }}
        >
          {isDistanceActive ? t.distanceActive : t.distanceInactive}
        </button>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <label htmlFor="date-picker" className="section-label">{t.dateLabel}</label>
        <input 
          id="date-picker" 
          type="date" 
          className="modern-input" 
          value={selectedDate} 
          onChange={(e) => onDateChange(e.target.value)} 
          max={new Date().toISOString().split("T")[0]}
        />
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <span className="section-label">{t.layerLabel}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {remoteSensingLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              style={{
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: activeLayer === layer.id ? '#3b82f6' : 'transparent',
                background: activeLayer === layer.id ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
        <label className="checkbox-label" style={{ color: '#ef4444' }}>
          <input 
            type="checkbox" 
            checked={showEonet}
            onChange={(e) => setShowEonet(e.target.checked)}
          />
          <span>{t.eonetLabel}</span>
        </label>
      </section>

      <section style={{ marginTop: '0.75rem' }}>
        <label htmlFor="opacity-slider" className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{t.opacityLabel}</span>
          <span style={{ color: 'var(--text-main)' }}>{Math.round(layerOpacity * 100)}%</span>
        </label>
        <input 
          id="opacity-slider"
          type="range" 
          min="0.1" 
          max="1" 
          step="0.05"
          value={layerOpacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent, #3b82f6)', cursor: 'pointer' }}
        />
      </section>

      {showEonet && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
          <span className="section-label" style={{ marginBottom: '0.375rem' }}>
            {language === 'id' ? 'FILTER KATEGORI BENCANA' : 'DISASTER CATEGORIES'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {categoryOptions.map((cat) => (
              <label key={cat.id} className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={eonetCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}