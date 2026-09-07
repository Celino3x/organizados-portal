import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle,
  Share2,
  Send,
  Download,
  Printer,
  Home,
  Building,
  Store,
  Navigation,
  Phone,
  Mail,
  Map,
  Globe,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  ArrowLeft,
  PlayCircle,
  StopCircle,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { territories, getStatusLabel, getStatusBadge, getTypeLabel } from '../data/territories';

interface TerritoryWork {
  id: string;
  territoryId: string;
  workerId: string;
  workerName: string;
  startDate: string;
  endDate?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  visits: number;
}

const TerritoryWorker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [territory, setTerritory] = useState(territories.find(t => t.id === id));
  const [work, setWork] = useState<TerritoryWork | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    if (!territory) {
      navigate('/territories');
    }
  }, [territory, navigate]);

  const handleStart = () => {
    if (!territory) return;
    setLoading(true);
    
    const newWork: TerritoryWork = {
      id: Date.now().toString(),
      territoryId: territory.id,
      workerId: 'current-user',
      workerName: 'João Silva',
      startDate: new Date().toISOString(),
      status: 'in_progress',
      visits: 0
    };
    
    setWork(newWork);
    setTerritory({ ...territory, status: 'in_progress' });
    setLoading(false);
    alert('✅ Trabalho iniciado! Registre suas visitas e anotações.');
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
    alert('🎉 Território concluído com sucesso!');
  };

  const handleShare = () => {
    if (!territory) return;
    
    const shareData = {
      title: `Território ${territory.number} - ${territory.name}`,
      text: `📍 Território ${territory.number}: ${territory.name}\n📌 Endereço: ${territory.address}\n📍 Ponto de Partida: ${territory.latitude}, ${territory.longitude}\n🔗 ${window.location.href}`
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareData.text}`).then(() => {
        alert('📋 Informações copiadas para a área de transferência!');
      });
    }
  };

  const handleCancel = () => {
    if (!work || !territory) return;
    
    if (confirm('Tem certeza que deseja cancelar este trabalho?')) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/territories')}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
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
              🔴 Em Andamento
            </span>
          )}
        </div>
      </div>

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
            <p className="text-xs text-[var(--text-muted)]">
              📍 {territory.latitude}, {territory.longitude}
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
                <p><span className="font-medium">Por:</span> {work.workerName}</p>
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
              disabled={work?.status === 'completed'}
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
              disabled={work?.status === 'completed'}
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

      {showInfo && (
        <div className="card mb-6">
          <div className="card-title">
            <Info className="w-5 h-5 text-[#1a3c6e]" />
            Informações Detalhadas
          </div>
          <div className="card-desc mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
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
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm flex items-start gap-2">
                <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">Ponto de Partida:</span> 
                  <br />
                  <span className="text-xs">{territory.latitude}, {territory.longitude}</span>
                  <br />
                  <button 
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    onClick={() => {
                      window.open(`https://www.google.com/maps?q=${territory.latitude},${territory.longitude}`, '_blank');
                    }}
                  >
                    Abrir no Google Maps
                  </button>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="alert alert-info flex items-start gap-3">
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Dicas para o trabalho:</strong>
          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
            <li>Registre o número de visitas realizadas</li>
            <li>Faça anotações sobre o território</li>
            <li>Ao finalizar, o território será marcado como concluído</li>
            <li>Compartilhe o território com outros publicadores se necessário</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TerritoryWorker;