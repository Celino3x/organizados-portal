import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Maximize2, Minimize2, ExternalLink, Info } from 'lucide-react';
import { KMLTerritory, loadKMLFromUrl } from '../../services/kmlService';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const highlightedIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  className: 'highlighted-marker',
});

interface KMLMapProps {
  mapId: string;
  territoryNumber?: number;
  height?: string;
  className?: string;
  highlightTerritory?: number;
  onTerritoriesLoaded?: (territories: KMLTerritory[]) => void;
}

const MapController = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const FlyToController = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const KMLMap: React.FC<KMLMapProps> = ({ 
  mapId = '11NYBu3CzYnHPvVLcg8sU7xmjK4V5y-A',
  territoryNumber,
  height = '500px',
  className = '',
  highlightTerritory,
  onTerritoriesLoaded
}) => {
  const [loading, setLoading] = useState(true);
  const [territories, setTerritories] = useState<KMLTerritory[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([-22.914794, -43.616536]);
  const [mapZoom, setMapZoom] = useState(13);
  const [showLegend, setShowLegend] = useState(true);

  // Carregar KML
  useEffect(() => {
    loadKML();
  }, [mapId]);

  const loadKML = async () => {
    setLoading(true);
    try {
      const url = `https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=${mapId}`;
      const data = await loadKMLFromUrl(url);
      setTerritories(data);
      
      // Notificar que os territórios foram carregados
      if (onTerritoriesLoaded) {
        onTerritoriesLoaded(data);
      }
      
      // Se tiver um território específico, centralizar nele
      if (territoryNumber) {
        const found = data.find(t => t.number === territoryNumber);
        if (found) {
          setMapCenter([found.center.lat, found.center.lng]);
          setMapZoom(16);
        }
      } else if (data.length > 0) {
        setMapCenter([data[0].center.lat, data[0].center.lng]);
      }
    } catch (error) {
      console.error('Erro ao carregar KML:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cores para os territórios
  const getColor = (number: number) => {
    const colors = [
      '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6',
      '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
      '#d946ef', '#0ea5e9', '#84cc16', '#e11d48', '#7c3aed',
      '#0891b2'
    ];
    return colors[(number - 1) % colors.length];
  };

  const isHighlighted = (number: number) => {
    return highlightTerritory && number === highlightTerritory;
  };

  const googleMapsUrl = `https://www.google.com/maps/d/u/0/viewer?mid=${mapId}`;

  const highlightedTerritory = highlightTerritory 
    ? territories.find(t => t.number === highlightTerritory) 
    : null;

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 z-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando mapa...</p>
          </div>
        </div>
      )}

      <div style={{ height: fullscreen ? '100vh' : height, width: '100%', position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={false}
        >
          <FlyToController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {territories.map((territory) => {
            const color = getColor(territory.number);
            const highlighted = isHighlighted(territory.number);
            
            return (
              <React.Fragment key={territory.id}>
                {highlighted && (
                  <Polygon
                    positions={territory.coordinates.map(c => [c.lat, c.lng] as LatLngExpression)}
                    pathOptions={{
                      color: '#60a5fa',
                      weight: 8,
                      opacity: 0.3,
                      fillColor: '#60a5fa',
                      fillOpacity: 0.05,
                    }}
                  />
                )}
                
                <Polygon
                  positions={territory.coordinates.map(c => [c.lat, c.lng] as LatLngExpression)}
                  pathOptions={{
                    color: highlighted ? '#2563eb' : color,
                    weight: highlighted ? 4 : 2,
                    opacity: highlighted ? 1 : 0.7,
                    fillColor: highlighted ? '#2563eb' : color,
                    fillOpacity: highlighted ? 0.35 : 0.2,
                    dashArray: highlighted ? undefined : '5, 5',
                  }}
                />
                
                {highlighted && (
                  <Polygon
                    positions={territory.coordinates.map(c => [c.lat, c.lng] as LatLngExpression)}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 2,
                      opacity: 0.6,
                      fillColor: 'transparent',
                      fillOpacity: 0,
                      className: 'pulsing-border',
                    }}
                  />
                )}
                
                <Marker
                  position={[territory.center.lat, territory.center.lng]}
                  icon={highlighted ? highlightedIcon : customIcon}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className={`font-bold ${highlighted ? 'text-blue-600' : 'text-gray-900'}`}>
                        Território #{territory.number}
                      </h3>
                      <p className="text-sm text-gray-600">{territory.name}</p>
                      {territory.areaKm2 && (
                        <p className="text-xs text-gray-500">📐 {territory.areaKm2} km²</p>
                      )}
                      {highlighted && (
                        <p className="text-xs text-blue-600 mt-1">⭐ Território atual</p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`https://www.google.com/maps?q=${territory.center.lat},${territory.center.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
                        >
                          Navegar
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {highlightedTerritory && (
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg border-2 border-blue-500 dark:border-blue-400 z-10 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">TERRITÓRIO ATUAL</span>
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-white mt-1">
              #{highlightedTerritory.number} - {highlightedTerritory.name}
            </p>
            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>📍 {highlightedTerritory.coordinates.length} pontos</span>
              {highlightedTerritory.areaKm2 && (
                <>
                  <span className="w-px h-3 bg-gray-300 dark:bg-slate-600"></span>
                  <span>📐 {highlightedTerritory.areaKm2} km²</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showLegend && (
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-600" style={{ borderTop: '2px solid #2563eb' }}></span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">Território atual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-gray-400" style={{ backgroundColor: 'rgba(37, 99, 235, 0.3)' }}></span>
              <span className="text-gray-500 dark:text-gray-400">Outros territórios</span>
            </div>
            <span className="text-gray-400 ml-auto">
              {territories.length} territórios carregados
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KMLMap;