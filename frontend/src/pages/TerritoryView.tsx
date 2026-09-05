import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Ruler, Share2, Navigation, CheckCircle } from 'lucide-react';
import KMLMap from '../components/maps/KMLMap';
import { Territory } from '../types';
import { TERRITORIES_DATA } from '../data/territories';
import { KMLTerritory, loadStartingPoints } from '../services/kmlService';

const MAP_ID = '11NYBu3CzYnHPvVLcg8sU7xmjK4V5y-A';
const LID_PONTOS_PARTIDA = 'vlfgnj-jG-4'; // LID do arquivo "Ponto de Partida do Território"

const TerritoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [kmlTerritory, setKmlTerritory] = useState<KMLTerritory | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingKml, setLoadingKml] = useState(true);
  const [usingExactCoords, setUsingExactCoords] = useState(false);

  useEffect(() => {
    loadTerritory();
    loadKML();
  }, [id]);

  const loadTerritory = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const found = TERRITORIES_DATA[id || '1'];
      if (found) {
        setTerritory(found);
      } else {
        navigate('/territories');
      }
    } catch (error) {
      console.error('Erro ao carregar território:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKML = async () => {
    setLoadingKml(true);
    try {
      // Usar o LID específico para carregar os pontos de partida
      const data = await loadStartingPoints(MAP_ID, LID_PONTOS_PARTIDA);
      
      if (data.length > 0 && id) {
        const found = data.find(t => t.number === parseInt(id));
        if (found && found.startingPoint) {
          setKmlTerritory(found);
          setUsingExactCoords(true);
          console.log('📍 Ponto de partida EXATO encontrado:', found.startingPoint);
          
          // Atualizar o território com as coordenadas exatas
          setTerritory(prev => {
            if (!prev) return null;
            return {
              ...prev,
              latitude: found.startingPoint!.lat,
              longitude: found.startingPoint!.lng
            };
          });
        } else {
          console.warn('⚠️ Ponto de partida não encontrado para o território', id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar KML:', error);
    } finally {
      setLoadingKml(false);
    }
  };

  const handleShare = () => {
    if (!territory) return;
    
    const lat = kmlTerritory?.startingPoint?.lat || territory.latitude;
    const lng = kmlTerritory?.startingPoint?.lng || territory.longitude;
    
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
    
    const message = 
      `📍 *TERRITÓRIO ${territory.number} - ${territory.name}*\n\n` +
      `📌 *Número:* ${territory.number}\n` +
      `📍 *Nome:* ${territory.name}\n` +
      `👥 *Grupo:* ${territory.group}\n` +
      `📏 *Área:* ${kmlTerritory?.areaKm2 || territory.area?.km2 || 0} km²\n\n` +
      `🗺️ *Ponto de partida:* ${googleMapsLink}\n\n` +
      `📱 *Compartilhado via Portal Organizados*`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleNavigate = () => {
    if (!territory) return;
    
    const lat = kmlTerritory?.startingPoint?.lat || territory.latitude;
    const lng = kmlTerritory?.startingPoint?.lng || territory.longitude;
    
    console.log(`📍 Navegando para o ponto de partida: ${lat}, ${lng}`);
    console.log(`📍 Fonte: ${kmlTerritory?.startingPoint ? 'KML (exato)' : 'Dados locais'}`);
    
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}&z=17`,
      '_blank'
    );
  };

  const getGoogleMapsLink = () => {
    if (!territory) return '#';
    const lat = kmlTerritory?.startingPoint?.lat || territory.latitude;
    const lng = kmlTerritory?.startingPoint?.lng || territory.longitude;
    return `https://www.google.com/maps?q=${lat},${lng}&z=17`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-[rgb(var(--foreground))] opacity-70 text-sm">Carregando território...</p>
        </div>
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--background))] p-4">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Território não encontrado</h2>
        <p className="text-[rgb(var(--foreground))] opacity-70 text-sm mt-1">O território que você procura não existe.</p>
        <button
          onClick={() => navigate('/territories')}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Header */}
      <header className="bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[rgb(var(--foreground))] opacity-80 hover:opacity-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[rgb(var(--foreground))] opacity-70">
              Território #{territory.number}
            </span>
            {usingExactCoords && (
              <span className="px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Ponto exato
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mapa */}
          <div className="bg-[rgb(var(--card))] rounded-2xl overflow-hidden shadow-sm border border-[rgb(var(--border))]">
            <KMLMap
              mapId={MAP_ID}
              territoryNumber={territory.number}
              highlightTerritory={territory.number}
              height="500px"
            />
            
            <div className="p-3 border-t border-[rgb(var(--border))] flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--foreground))] opacity-70">
              <span>📍 Ponto de partida: {territory.latitude.toFixed(6)}, {territory.longitude.toFixed(6)}</span>
              <span className="w-px h-4 bg-[rgb(var(--border))]"></span>
              <span>📐 Fonte: {usingExactCoords ? 'KML (exato)' : 'Dados locais'}</span>
            </div>
          </div>

          {/* Cartão do Território */}
          <div className="bg-[rgb(var(--card))] rounded-2xl shadow-lg border border-[rgb(var(--border))] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    Cartão Digital
                  </span>
                  <h2 className="text-xl font-bold mt-1">Território #{territory.number}</h2>
                  <p className="text-sm opacity-90">{territory.name}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">📍</span>
                </div>
              </div>
            </div>

            {/* Corpo */}
            <div className="p-4 space-y-4">
              {/* Ponto de Partida Exato */}
              <div className={`rounded-xl p-4 border ${
                usingExactCoords 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Navigation className={`w-4 h-4 ${
                    usingExactCoords ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    usingExactCoords ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {usingExactCoords ? '✅ Ponto de partida EXATO (KML)' : '⚠️ Ponto de partida aproximado'}
                  </span>
                </div>
                <div className="mt-2 font-mono text-sm text-[rgb(var(--foreground))]">
                  {territory.latitude.toFixed(6)}, {territory.longitude.toFixed(6)}
                </div>
                {usingExactCoords && (
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                    🎯 Extraído do arquivo "Ponto de Partida do Território"
                  </div>
                )}
              </div>

              {/* Botão de Navegação */}
              <button
                onClick={handleNavigate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                <Navigation className="w-4 h-4" />
                Abrir no Google Maps
              </button>

              {/* Botão Compartilhar */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar WhatsApp
              </button>

              {/* Link direto */}
              <div className="pt-2 border-t border-[rgb(var(--border))]">
                <p className="text-xs text-[rgb(var(--foreground))] opacity-60 mb-1">🔗 Link do Google Maps:</p>
                <a
                  href={getGoogleMapsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {getGoogleMapsLink()}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritoryView;