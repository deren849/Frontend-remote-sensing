
import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const videoBg = "https://files.catbox.moe/rhdqv7.mp4";

export default function LandingPage({
  onLaunchMap,
  language,
  setLanguage,
  colorBlindMode,
  setColorBlindMode,
  speakText,
  fontSize,    
  setFontSize
}) {
  const [activeTab, setActiveTab] = useState('satelit');
  const [showAbout, setShowAbout] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  const content = {
    id: {
      aboutBtn: "Tentang",
      exploreBtn: "Jelajahi Peta ➔",
      heroTitle1: "Lihat Bumi",
      heroTitle2: "Tanpa Batas",
      heroSub: "Platform Web GIS canggih yang menggabungkan citra satelit NASA, radar asteroid, dan pemantauan bencana alam dalam antarmuka yang ramah aksesibilitas.",
      launchBtn: "Buka Peta Interaktif",
      readPageBtn: "🔊 Bacakan Halaman",
      colorBlindLabel: "Filter Warna:",
      accessTitle: "Pengaturan Aksesibilitas",
      fontSizeLabel: "Ukuran Teks:",
      tabs: {
        satelit: {
          title: "Citra Satelit NASA Worldview",
          desc: "Akses data mentah dari satelit MODIS (Terra & Aqua) secara real-time. Lihat kondisi permukaan Bumi, titik api kebakaran hutan, hingga tutupan awan global.",
          icon: "🛰️"
        },
        aksesibilitas: {
          title: "Inklusivitas Tanpa Kompromi",
          desc: "Didesain untuk semua orang. Dilengkapi fitur Text-to-Speech otomatis, navigasi keyboard penuh, dan filter khusus untuk tipe buta warna (Protanopia, Deuteranopia, Tritanopia).",
          icon: "♿"
        },
        asteroid: {
          title: "Waspada Benda Langit",
          desc: "Terintegrasi dengan NASA NeoWs API. Lacak asteroid yang mendekati Bumi hari ini, lengkap dengan data diameter, kecepatan, dan potensi tingkat bahayanya.",
          icon: "☄️"
        }
      }
    },
    en: {
      aboutBtn: "About",
      exploreBtn: "Explore Map ➔",
      heroTitle1: "View Earth",
      heroTitle2: "Without Limits",
      heroSub: "An advanced Web GIS platform combining NASA satellite imagery, asteroid radar, and natural disaster monitoring in an accessibility-friendly interface.",
      launchBtn: "Launch Interactive Map",
      readPageBtn: "🔊 Read Page Aloud",
      colorBlindLabel: "Color Filter:",
      accessTitle: "Accessibility Settings",
      fontSizeLabel: "Text Size:",
      tabs: {
        satelit: {
          title: "NASA Worldview Satellite Imagery",
          desc: "Access raw real-time data from MODIS satellites (Terra & Aqua). View Earth's surface conditions, forest fire hotspots, and global cloud cover.",
          icon: "🛰️"
        },
        aksesibilitas: {
          title: "Uncompromising Inclusivity",
          desc: "Designed for everyone. Features automatic Text-to-Speech, full keyboard navigation, and custom filters for color blindness (Protanopia, Deuteranopia, Tritanopia).",
          icon: "♿"
        },
        asteroid: {
          title: "Celestial Object Alert",
          desc: "Integrated with NASA NeoWs API. Track asteroids approaching Earth today, complete with diameter, speed, and potential threat levels.",
          icon: "☄️"
        }
      }
    }
  };

  const t = content[language];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAbout(false);
        setIsAccessOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);




  const handleReadLanding = () => {
    const textToRead = `${t.heroTitle1} ${t.heroTitle2}. ${t.heroSub}`;
    speakText(textToRead, false);
  };

  return (
    <div className='landing-container'>
      <div className='video-background'>
        <div className='video-overlay'></div>
        <video src={videoBg} autoPlay loop muted playsInline />
      </div>

      <header className='landing-header glass-effect'>
        <div className='logo'>Cosmic<span className='accent'>view</span> GIS</div>

        <nav className='header-nav' style={{ position: 'relative' }}>
          <button
            className={`btn-secondary ${isAccessOpen ? 'active' : ''}`}
            onClick={() => setIsAccessOpen(!isAccessOpen)}
            aria-label="Panel Aksesibilitas"
          >
            ♿ Aksesibilitas
          </button>

          <button className='btn-secondary' onClick={() => setShowAbout(true)}>{t.aboutBtn}</button>
          <button className='btn-primary' onClick={onLaunchMap}>{t.exploreBtn}</button>

          {/* Panel Aksesibilitas Popover */}
          {isAccessOpen && (
            <div className="accessibility-popover glass-effect" style={{
              position: 'absolute',
              top: '120%',
              right: '0',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: '260px',
              zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#38bdf8' }}>{t.accessTitle}</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px' }}>Bahasa / Language:</span>
                <button
                  className='btn-secondary'
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  {language.toUpperCase()}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px' }}>{t.fontSizeLabel}</span>
                <div className="btn-toggle-group">
                  <button className={fontSize === 'normal' ? 'active' : ''} onClick={() => setFontSize('normal')}>A</button>
                  <button className={fontSize === 'large' ? 'active' : ''} onClick={() => setFontSize('large')}>A+</button>
                  <button className={fontSize === 'xlarge' ? 'active' : ''} onClick={() => setFontSize('xlarge')}>A++</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px' }}>{t.colorBlindLabel}</span>
                <select 
                  className="modern-select" 
                  value={colorBlindMode} 
                  onChange={(e) => setColorBlindMode(e.target.value)}
                  style={{ padding: '6px 8px', fontSize: '12px', width: '100%' }}
                >
                  <option value="filter-normal">Normal</option>
                  <option value="filter-protanopia">Protanopia</option>
                  <option value="filter-deuteranopia">Deuteranopia</option>
                  <option value="filter-tritanopia">Tritanopia</option>
                  <option value="filter-grayscale">Grayscale</option>
                </select>
              </div>

              <button 
                className="btn-primary" 
                onClick={handleReadLanding} 
                style={{ padding: '8px', fontSize: '12px', marginTop: '4px' }}
              >
                {t.readPageBtn}
              </button>
            </div>
          )}
        </nav>
      </header>

      <section className='hero-section'>
        <div className='hero-content'>
          <h1 className='hero-title'>{t.heroTitle1}<span className='display-block'>{t.heroTitle2}</span></h1>
          <p className='hero-subtitle'>{t.heroSub}</p>
          <button className='btn-lg-primary' onClick={onLaunchMap}>{t.launchBtn}</button>
        </div>
      </section>

      <section className='info-tabs-section'>
        <div className='info-container glass-effect'>
          <div className='tabs-header' role='tablist'>
            {Object.keys(t.tabs).map((tabkey) => (
              <button 
                key={tabkey}
                className={`tab-btn ${activeTab === tabkey ? 'active' : ''}`}
                onClick={() => setActiveTab(tabkey)}
                role='tab'
                aria-selected={activeTab === tabkey}
              >
                <span className='tab-icon' aria-hidden='true'>{t.tabs[tabkey].icon}</span>
                {t.tabs[tabkey].title.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className='tab-body' role='tabpanel'>
            <h2>{t.tabs[activeTab].icon} {t.tabs[activeTab].title}</h2>
            <p>{t.tabs[activeTab].desc}</p>
          </div>
        </div>
      </section>

      {showAbout && (
        <div className='modal-overlay' onClick={() => setShowAbout(false)}>
          <div className='modal-content glass-effect' onClick={(e) => e.stopPropagation()}>
            <button className='close-btn' onClick={() => setShowAbout(false)}>X</button>
            <h2>Tentang CosmicView GIS</h2>
            <p className="modal-intro">
              CosmicView GIS adalah platform pemetaan interaktif yang berfokus pada inklusivitas data geospasial dan fenomena antariksa.
            </p>
            <div className="modal-section">
              <h3>🎯 Misi Inklusivitas</h3>
              <p>
                Aplikasi ini dirancang khusus agar dapat diakses secara optimal oleh penyandang disabilitas netra maupun gangguan persepsi warna (buta warna), menggunakan kombinasi sinyal suara (Text-to-Speech) dan filter matriks warna khusus.
              </p>
            </div>
            <div className="modal-section">
              <h3>🛰️ Sumber Data & API</h3>
              <p>
                Visualisasi bumi dan bencana dipasok langsung oleh API resmi NASA GIBS (Global Imagery Browse Services) dan NASA EONET. Data asteroid menggunakan NASA NeoWs.
              </p>
            </div>
            <div className="modal-footer-text">
              Dibuat dan dikembangkan oleh <strong>Deren</strong>.
            </div>
          </div>
        </div>
      )}

      <footer className='landing-footer'>
        <div className='footer-content'>
          <p>© 2026 <strong>Deren</strong>. All rights reserved.</p>
          <p className="footer-disclaimer">
            Data citra satelit dan informasi benda langit disediakan oleh <strong>NASA Earthdata (GIBS / EONET)</strong>. 
            Proyek ini dikembangkan secara independen dan tidak terafiliasi secara resmi dengan NASA.
          </p>
        </div>
      </footer>
    </div>
  );
}