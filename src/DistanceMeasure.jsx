import React, { useState, useEffect, useRef } from "react";
import { useMapEvents, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const customMarker = new L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function getHaversineDistance(coords1, coords2) {
  const R = 6371;
  const dLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const dLon = ((coords2[1] - coords1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coords1[0] * Math.PI) / 180) *
      Math.cos((coords2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DistanceMeasure({ isActive, speakText, language = 'id' }) {
  const [points, setPoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const hasSpokenRef = useRef(false);

  const t = {
    id: {
      title: "Pengukur Jarak",
      reset: "Reset Titik",
      instruction: "Klik 2 titik di peta untuk mengukur jarak",
      total: "Total Jarak"
    },
    en: {
      title: "Distance Measure",
      reset: "Reset Points",
      instruction: "Click 2 points on the map to measure distance",
      total: "Total Distance"
    }
  }[language || 'id'];

  useEffect(() => {
    if (!isActive) {
      setPoints([]);
      setTotalDistance(0);
      hasSpokenRef.current = false;
    }
  }, [isActive]);

  useEffect(() => {
    if (points.length === 2) {
      const dist = getHaversineDistance(points[0], points[1]);
      setTotalDistance(dist);

      if (speakText && !hasSpokenRef.current) {
        const text = language === 'en'
          ? `Total distance: ${dist.toFixed(2)} kilometers`
          : `Total jarak: ${dist.toFixed(2)} kilometer`;
        speakText(text, true);
        hasSpokenRef.current = true;
      }
    } else {
      setTotalDistance(0);
      hasSpokenRef.current = false;
    }
  }, [points, language, speakText]);

  useMapEvents({
    click(e) {
      if (!isActive || points.length >= 2) return;
      setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    }
  });

  if (!isActive) return null;

  return (
    <>
      <Polyline positions={points} color="#f59e0b" weight={4} dashArray="6, 8" />
      {points.map((pt, idx) => (
        <Marker key={idx} position={pt} icon={customMarker}>
          <Popup>{idx === 0 ? "Titik Awal (A)" : "Titik Akhir (B)"}</Popup>
        </Marker>
      ))}

      <div 
        className="glass-panel distance-measure-box"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()} 
      >
        <div className="distance-title">
          📏 {t.title}
        </div>

        <div className="distance-subtext">
          {points.length === 0 && t.instruction}
          {points.length === 1 && (language === 'en' ? 'Click 1 more point...' : 'Klik 1 titik lagi...')}
          {points.length === 2 && `${t.total}: ${totalDistance.toFixed(2)} km`}
        </div>

        {points.length > 0 && (
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setPoints([]);
            }}
            className="btn-action btn-reset-measure"
          >
            {t.reset}
          </button>
        )}
      </div>
    </>
  );
}