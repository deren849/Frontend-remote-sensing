import React, { useState, useEffect} from "react";

export default function SpaceDashboard({ selectedDate,  isOpen, setIsOpen, isRsOpen, language, isAccessOpen = true }) {
    const [asteroids, setAsteroids] = useState([]);
    const [loading, setLoading] = useState(false);

    const t = {
        id: {
            toggleBtn: "Radar Asteroid",
            title: "Radar Asteroid (NeoWs)",
            loading: "Memuat luar angkasa...",
            noData: "Tidak ada data hari ini.",
            diameter: "Diameter",
            speed: "Kecepatan"
        },
        en: {
            toggleBtn: "Asteroid Radar",
            title: "Asteroid Radar (NeoWs)",
            loading: "Loading space data...",
            noData: "No data available today.",
            diameter: "Diameter",
            speed: "Velocity"
        }
    }[language || 'id'];

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

        const rawBackendUrl = import.meta.env.VITE_API_URL || 'v4GbsE3W4YaHeaS0uBDUpdUTlrkDe3vWKldYS2eM';
        const backendUrl = rawBackendUrl.replace(/\/$/, '');

        fetch(`${backendUrl}/api/neows?start_date=${selectedDate}&end_date=${selectedDate}`, {
        signal: controller.signal
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Gagal mengambil data NeoWs: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            const todayAsteroids = data.near_earth_objects?.[selectedDate] || [];
            setAsteroids(todayAsteroids.slice(0, 3));
            setLoading(false);
        })
        .catch(err => {
            if (err.name !== 'AbortError') {
                console.error("[NeoWs Fetch Error]:", err.message);
                setAsteroids([]);
                setLoading(false);
            }
        });

    return () => controller.abort();
}, [selectedDate]);

const accessClass = isAccessOpen ? 'access-open' : 'access-closed';
const rsClass = isRsOpen ? 'rs-open' : 'rs-closed';

    if (!isOpen) {
        return (
            <button
            className={`panel-toggle-btn space-dashboard-toggle ${rsClass} ${accessClass}`}
            onClick={() => setIsOpen(true)}
            >
                {t.toggleBtn}
            </button>
        )
    }


return (

    <aside className={`glass-panel space-dashboard-panel ${rsClass} ${accessClass}`} 
        style={{ position: 'absolute', bottom: '20px', zIndex: 9000, width: '300px', right: '20px',}}
        >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#3b82f6',  display: 'flex', alignItems: 'center', gap: '8px'}}>
                Radar Asteroid (NeoWs)
            </h3>

            <button 
            onClick={() => setIsOpen(false)}
            style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '0 4px'}}
            title="tutup panel"
            >
                ✕
            </button>
        </div>
        {loading ? (
            <p style={{fontSize: '12px', color: '#94a3b8'}}>{t.loading}...</p>
        ) : asteroids.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.noData}.</p>
        ) : (
            <div className='asteroid-list'>
                {asteroids.map(ast =>
                    <div className='asteroid-card' 
                         key={ast.id} 
                         style={{borderLeft: ast.is_potentially_hazardous_asteroid ? '3px solid #ef4444' : '3px solid #22c55e', }}>
                        <strong className="asteroid-title">{ast.name}</strong>   
                        <div className="asteroid-info">
                            {t.diameter}: {parseFloat(ast.estimated_diameter?.meters?.estimated_diameter_max || 0).toFixed(0)} meter<br/>
                            {t.speed}: {parseFloat(ast.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 0).toFixed(2)} km/s
                        </div>
                    </div>
               )}
            </div>
        )}
    </aside>
    );
}