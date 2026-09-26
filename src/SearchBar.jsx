import React, { useState } from "react";
import { useMap } from 'react-leaflet';

export default function SearchBar({ language = 'id'}) {
    const [query, setQuery] = useState('');
    const map =  useMap();

    const placeholderText = language === 'en' ? 'Search region/city...' : 'cari wilayah/kota...';
    const notFoundText = language === 'en' ? 'Location not found!' : 'lokasi tidak di temukan!';

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'User-Agent': 'WebGIS-NASA-App/1.0'
                }
            }
        );
            const data = await res .json();

            if (data && data.length > 0) {
                const { lat, lon} = data[0];
                map.flyTo([parseFloat(lat), parseFloat(lon)], 8, {duration: 1.5});
            } else {
                alert(notFoundText);
            }
        } catch (err) {
            console.error('error geocoding:', err)
        }
    };

    const handleContainerClick = (e) => {
         e.stopPropagation();
         console.log('[SearchBar] Event click diisolasi (tidak tembus ke peta)');
        };

    return (
    <form
    className="search-bar-container"
    onSubmit={handleSearch}
    onClick={handleContainerClick}
    onMouseDown={(e) => e.stopPropagation()}
    style={{ top: '20px', zIndex: 1000}}
    >
    
    <input 
    type="text"
    placeholder={placeholderText}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="modern-input"
    style={{width: '220px', margin: 0,}}
    />
    </form>
    );
}