import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { Territory } from '../../data/territories';

interface TerritoryMapProps {
  territories: Territory[];
  center?: [number, number];
  zoom?: number;
}

const TerritoryMap: React.FC<TerritoryMapProps> = ({ 
  territories, 
  center = [-22.914, -43.610], 
  zoom = 15 
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ícone customizado para os marcadores
  const createMarkerIcon = (status: string) => {
    const colors: Record<string, string> = {
      available: '#22c55e',
      assigned: '#eab308',
      in_progress: '#3b82f6',
      completed: '#8b5cf6'
    };

    const color = colors[status] || '#22c55e';

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  if (!isClient) {
    return (
      <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      className="rounded-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {territories.map((territory) => (
        <div key={territory.id}>
          <Marker
            position={[territory.longitude, territory.latitude]}
            icon={createMarkerIcon(territory.status)}
          >
            <Popup>
              <div className="text-sm">
                <strong>#{territory.number}</strong> - {territory.name}
                <br />
                <span className="text-xs text-gray-500">
                  {territory.address}
                </span>
                <br />
                <span className="text-xs">
                  Status: {territory.status}
                </span>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  );
};

export default TerritoryMap;