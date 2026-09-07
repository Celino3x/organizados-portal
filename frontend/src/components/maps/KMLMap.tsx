import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface KMLMapProps {
  kmlUrl: string;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const KMLMap: React.FC<KMLMapProps> = ({
  kmlUrl,
  center = [-22.914, -43.610],
  zoom = 15,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializar o mapa
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Adicionar tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Carregar KML
    if (kmlUrl) {
      fetch(kmlUrl)
        .then(response => response.text())
        .then(kmlText => {
          // Parse KML (usando DOMParser)
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
          const placemarks = xmlDoc.getElementsByTagName('Placemark');

          // Processar placemarks
          for (let i = 0; i < placemarks.length; i++) {
            const placemark = placemarks[i];
            const name = placemark.getElementsByTagName('name')[0]?.textContent || 'Território';
            const description = placemark.getElementsByTagName('description')[0]?.textContent || '';
            const coordinates = placemark.getElementsByTagName('coordinates')[0]?.textContent;

            if (coordinates) {
              // Processar coordenadas (formato KML: lon,lat,alt)
              const coords = coordinates.trim().split(/\s+/).map(pair => {
                const [lng, lat] = pair.split(',').map(Number);
                return [lat, lng];
              });

              // Criar polígono
              const polygon = L.polygon(coords, {
                color: '#1a3c6e',
                weight: 2,
                fillColor: '#3b82f6',
                fillOpacity: 0.2
              });

              polygon.addTo(map);
              polygon.bindPopup(`
                <div class="text-sm">
                  <strong>${name}</strong>
                  <br />
                  <span class="text-xs text-gray-500">${description}</span>
                </div>
              `);
            }
          }
        })
        .catch(error => console.error('Erro ao carregar KML:', error));
    }

    // Limpeza
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [kmlUrl, center, zoom]);

  return <div ref={mapRef} className={`w-full h-[500px] rounded-xl ${className}`} />;
};

export default KMLMap;