import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle,
  Share2,
  Printer,
  Navigation,
  Globe,
  Eye,
  Info,
  ArrowLeft,
  PlayCircle,
  Check,
  Maximize2,
  Minimize2,
  Send,
  Copy,
  Link as LinkIcon
} from 'lucide-react';
import { territories, getStatusLabel, getStatusBadge, getTypeLabel } from '../data/territories';
import { getLeafletPolygon } from '../data/polygons';

interface TerritoryWork {
  id: string;
  territoryId: string;
  workerName: string;
  startDate: string;
  endDate?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  visits: number;
}

// Ícone customizado
const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-marker-start',
    html: `<div style="
      background-color: #22c55e;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
    ">🏠</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const TerritoryWorkerPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [territory, setTerritory] = useState(territories.find(t => t.id === id));
  const [work, setWork] = useState<TerritoryWork | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [visits, setVisits] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [polygonData, setPolygonData] = useState<[number, number][] | null>(null);
  
  // Estado para identificação do usuário
  const [workerName, setWorkerName] = useState('');
  const [isIdentified, setIsIdentified] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!territory) {
      navigate('/territories');
    } else {
      const polygon = getLeafletPolygon(territory.number);
      setPolygonData(polygon);
      // Gerar link de compartilhamento
      setShareLink(window.location.href);
    }
  }, [territory, navigate]);

  const handleIdentify = () => {
    if (workerName.trim().length < 3) {
      alert('Por favor, digite seu nome completo (mínimo 3 caracteres)');
      return;
    }
    setIsIdentified(true);
  };

  const handleStart = () => {
    if (!territory) return;
    setLoading(true);
    
    const newWork: TerritoryWork = {
      id: Date.now().toString(),
      territoryId: territory.id,
      workerName: workerName,
      startDate: new Date().toISOString(),
      status: 'in_progress',
      visits: 0
    };
    
    setWork(newWork);
    setTerritory({ ...territory, status: 'in_progress' });
    setLoading(false);
    alert(`✅ Trabalho iniciado por ${workerName}! Registre suas visitas e anotações.`);
  };

  const handleComplete = () => {
    if (!work || !territory) return;
    setLoading(true);
    
    const completedWork: TerritoryWork = {
      ...work,
      endDate: new Date().toISOString(),
      status: 'completed',
      notes: notes,
      visits: visits
    };
    
    setWork(completedWork);
    setTerritory({ ...territory, status: 'completed', visits: territory.visits + visits });
    setLoading(false);
    alert(`🎉 Território concluído por ${workerName}!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('📋 Link copiado para a área de transferência! Compartilhe com outros publicadores.');
    }).catch(() => {
      alert(`📋 Compartilhe este link: ${shareLink}`);
    });
  };

  const handleCancel = () => {
    if (!work || !territory) return;
    
    if (confirm(`Tem certeza que deseja cancelar o trabalho de ${workerName}?`)) {
      setWork(null);
      setTerritory({ ...territory, status: 'available' });
      alert('🔄 Trabalho cancelado. Território disponível novamente.');
    }
  };

  if (!territory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)]">Carregando...</div>
      </div>
    );
  }

  const startIcon = createStartIcon();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header com navegação e compartilhamento */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <button
          onClick={() => navigate('/territories')}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowShareModal(!showShareModal)}
            className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Compartilhar Território
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Qualquer pessoa com este link pode acessar e trabalhar no território.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm"
              />
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-[#1a3c6e] text-white rounded-lg hover:bg-[#153058] transition flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>
            <div className="mt-4 text-xs text-[var(--text-muted)]">
              🔗 O publicador precisará se identificar com o nome ao iniciar o trabalho.
            </div>
          </div>
        </div>
      )}

      {/* Identificação do Publicador */}
      {!isIdentified ? (
        <div className="card mb-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="card-title text-lg">
            <User className="w-6 h-6 text-blue-600" />
            Identifique-se para trabalhar
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Para iniciar o trabalho neste território, informe seu nome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Digite seu nome completo..."
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            />
            <button
              onClick={handleIdentify}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Identificar
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            ⚠️ O nome será registrado no histórico do território.
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Trabalhando como: <strong>{workerName}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              if (confirm('Deseja sair e identificar outro publicador?')) {
                setIsIdentified(false);
                setWorkerName('');
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 transition"
          >
            Trocar publicador
          </button>
        </div>
      )}

      {/* Título e Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Território #{territory.number}
          </h1>
          <p className="text-[var(--text-muted)]">{territory.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${getStatusBadge(territory.status)} text-sm px-4 py-1.5`}>
            {getStatusLabel(territory.status)}
          </span>
          {work?.status === 'in_progress' && (
            <span className="badge badge-blue text-sm px-4 py-1.5 animate-pulse">
              🔴 Em Andamento ({workerName})
            </span>
          )}
        </div>
      </div>

      {/* MAPA */}
      <div className={`mb-6 ${mapExpanded ? 'fixed inset-4 z-50' : ''}`}>
        <div className="card p-0 overflow-hidden relative">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <button
              onClick={() => setMapExpanded(!mapExpanded)}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={mapExpanded ? 'Minimizar mapa' : 'Expandir mapa'}
            >
              {mapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => window.open(`https://www.google.com/maps?q=${territory.latitude},${territory.longitude}`, '_blank')}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Abrir no Google Maps"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
          
          {isClient ? (
            <MapContainer
              center={[territory.longitude, territory.latitude]}
              zoom={16}
              style={{ height: mapExpanded ? 'calc(100vh - 100px)' : '400px', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {polygonData && polygonData.length > 0 && (
                <Polygon
                  positions={polygonData}
                  pathOptions={{
                    color: '#1a3c6e',
                    weight: 3,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2
                  }}
                >
                  <Popup>
                    <div className="text-sm font-medium">
                      Território #{territory.number}
                      <br />
                      <span className="text-xs text-gray-500">{territory.name}</span>
                    </div>
                  </Popup>
                </Polygon>
              )}

              <Marker
                position={[territory.longitude, territory.latitude]}
                icon={startIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>🏠 Ponto de Partida</strong>
                    <br />
                    <span className="text-xs text-gray-500">Território #{territory.number}</span>
                    <br />
                    <button 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                      onClick={() => {
                        window.open(`https://www.google.com/maps?q=${territory.latitude},${territory.longitude}`, '_blank');
                      }}
                    >
                      Abrir no Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-[var(--text-muted)]">Carregando mapa...</div>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block border-2 border-white shadow"></span>
                <span className="text-[var(--text-muted)]">Ponto de Partida</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block border-2 border-white shadow"></span>
                <span className="text-[var(--text-muted)]">Área do Território</span>
              </span>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir//${territory.latitude},${territory.longitude}`, '_blank')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              Como chegar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-title">
            <MapPin className="w-5 h-5 text-[#1a3c6e]" />
            Localização
          </div>
          <div className="card-desc mt-2 space-y-1">
            <p><span className="font-medium">Endereço:</span> {territory.address}</p>
            <p><span className="font-medium">Tipo:</span> {getTypeLabel(territory.type)}</p>
            <p><span className="font-medium">Grupo:</span> {territory.group}</p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Ponto de Partida: {territory.latitude}, {territory.longitude}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <Info className="w-5 h-5 text-[#1a3c6e]" />
            Informações do Trabalho
          </div>
          <div className="card-desc mt-2 space-y-1">
            {work ? (
              <>
                <p><span className="font-medium">Iniciado:</span> {new Date(work.startDate).toLocaleDateString('pt-BR')}</p>
                <p><span className="font-medium">Por:</span> <strong>{work.workerName}</strong></p>
                {work.endDate && (
                  <p><span className="font-medium">Finalizado:</span> {new Date(work.endDate).toLocaleDateString('pt-BR')}</p>
                )}
                <p><span className="font-medium">Status:</span> {work.status === 'in_progress' ? 'Em andamento' : work.status === 'completed' ? 'Concluído' : 'Cancelado'}</p>
              </>
            ) : (
              <p className="text-[var(--text-muted)]">Nenhum trabalho iniciado</p>
            )}
          </div>
        </div>
      </div>

      {/* Controles do Worker - APENAS PARA IDENTIFICADOS */}
      {isIdentified && (
        <div className="card mb-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="card-title text-lg">
            <PlayCircle className="w-6 h-6 text-blue-600" />
            Controle do Território
          </div>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Número de Visitas
              </label>
              <input
                type="number"
                min="0"
                value={visits}
                onChange={(e) => setVisits(parseInt(e.target.value) || 0)}
                disabled={work?.status === 'completed' || !isIdentified}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Anotações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={work?.status === 'completed' || !isIdentified}
                placeholder="Observações sobre o território..."
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!work ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                <PlayCircle className="w-5 h-5" />
                Iniciar Trabalho
              </button>
            ) : work.status === 'in_progress' ? (
              <>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Finalizar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar
                </button>
              </>
            ) : (
              <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Trabalho concluído com sucesso!
              </div>
            )}
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showInfo ? 'Ocultar' : 'Ver'} Informações
            </button>
          </div>
        </div>
      )}

      {!isIdentified && (
        <div className="alert alert-warning flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <strong>🔒 Identifique-se para trabalhar</strong>
            <p className="text-sm mt-1">
              Para iniciar, registrar visitas ou finalizar o território, você precisa se identificar com seu nome.
            </p>
          </div>
        </div>
      )}

      {/* Informações Detalhadas */}
      {showInfo && (
        <div className="card mb-6">
          <div className="card-title">
            <Info className="w-5 h-5 text-[#1a3c6e]" />
            Informações Detalhadas
          </div>
          <div className="card-desc mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 bg-[var(--bg-card)] rounded-lg">
                <span className="text-xs text-[var(--text-muted)] block">Número</span>
                <span className="font-bold text-lg">#{territory.number}</span>
              </div>
              <div className="p-3 bg-[var(--bg-card)] rounded-lg">
                <span className="text-xs text-[var(--text-muted)] block">Tipo</span>
                <span>{getTypeLabel(territory.type)}</span>
              </div>
              <div className="p-3 bg-[var(--bg-card)] rounded-lg">
                <span className="text-xs text-[var(--text-muted)] block">Grupo</span>
                <span>{territory.group}</span>
              </div>
              <div className="p-3 bg-[var(--bg-card)] rounded-lg">
                <span className="text-xs text-[var(--text-muted)] block">Visitas</span>
                <span>{territory.visits}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="alert alert-info flex items-start gap-3">
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <strong>📋 Como funciona o compartilhamento:</strong>
          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
            <li>Compartilhe o link com qualquer publicador da congregação</li>
            <li>Ao acessar, o publicador identifica-se com o nome</li>
            <li>Registra visitas e anotações durante o trabalho</li>
            <li>Ao finalizar, o território é marcado como concluído</li>
            <li>O nome do publicador fica registrado no histórico</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TerritoryWorkerPublic;