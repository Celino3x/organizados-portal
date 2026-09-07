import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin,
  List,
  Grid,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Download,
  Upload,
  PlayCircle,
  Share2,
  Globe
} from 'lucide-react';
import { territories, groups, getStatusLabel, getStatusBadge, getTypeLabel, Territory } from '../data/territories';
import TerritoryMap from '../components/maps/TerritoryMap';

type ViewMode = 'list' | 'map';

const TerritoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  const statuses = ['Todos', 'Disponível', 'Designado', 'Em Andamento', 'Concluído'];

  const filteredTerritories = useMemo(() => {
    return territories.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.number.toString().includes(search);
      const matchGroup = filterGroup === '' || filterGroup === 'Todos' || t.group === filterGroup;
      const matchStatus = filterStatus === '' || filterStatus === 'Todos' || 
                          getStatusLabel(t.status) === filterStatus;
      return matchSearch && matchGroup && matchStatus;
    });
  }, [search, filterGroup, filterStatus]);

  const stats = {
    total: territories.length,
    available: territories.filter(t => t.status === 'available').length,
    assigned: territories.filter(t => t.status === 'assigned').length,
    inProgress: territories.filter(t => t.status === 'in_progress').length,
    completed: territories.filter(t => t.status === 'completed').length
  };

  // Função para compartilhar o território publicamente
  const handleSharePublic = (territory: Territory) => {
    const url = `${window.location.origin}/territories/${territory.id}/public`;
    if (navigator.share) {
      navigator.share({
        title: `Território ${territory.number} - ${territory.name}`,
        text: `📍 Território ${territory.number}: ${territory.name}\n📌 Endereço: ${territory.address}\n🔗 ${url}`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('🔗 Link público copiado! Compartilhe com qualquer publicador.');
      }).catch(() => {
        // Fallback: mostrar o link em um prompt
        prompt('Copie o link abaixo para compartilhar:', url);
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="header mb-8 text-center border-b-2 border-[var(--border-color)] pb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-[#1a3c6e] dark:text-blue-400" />
          Territórios
        </h1>
        <p className="text-[var(--text-muted)] text-base mt-1">
          Gerencie os {territories.length} territórios da congregação
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
          <div className="text-xs text-[var(--text-muted)]">Total</div>
        </div>
        <div className="card text-center border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.available}</div>
          <div className="text-xs text-[var(--text-muted)]">Disponíveis</div>
        </div>
        <div className="card text-center border-yellow-200 dark:border-yellow-800">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.assigned}</div>
          <div className="text-xs text-[var(--text-muted)]">Designados</div>
        </div>
        <div className="card text-center border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
          <div className="text-xs text-[var(--text-muted)]">Em Andamento</div>
        </div>
        <div className="card text-center border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.completed}</div>
          <div className="text-xs text-[var(--text-muted)]">Concluídos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            <option value="">Todos os grupos</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            <option value="">Todos os status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl border transition ${
              viewMode === 'list' 
                ? 'bg-[#1a3c6e] text-white border-[#1a3c6e]' 
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Visualizar lista"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2.5 rounded-xl border transition ${
              viewMode === 'map' 
                ? 'bg-[#1a3c6e] text-white border-[#1a3c6e]' 
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
            title="Visualizar mapa"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mapa ou Lista */}
      {viewMode === 'map' ? (
        <div className="mb-6">
          <TerritoryMap territories={filteredTerritories} />
          <div className="mt-2 text-sm text-[var(--text-muted)] text-center">
            Mostrando {filteredTerritories.length} de {territories.length} territórios no mapa
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Grupo</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Visitas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTerritories.length > 0 ? (
                filteredTerritories.map((territory) => (
                  <tr key={territory.id} className="hover:bg-[var(--bg-hover)] transition">
                    <td className="font-mono font-bold text-[#1a3c6e] dark:text-blue-400">
                      {territory.number}
                    </td>
                    <td className="font-medium">{territory.name}</td>
                    <td>
                      <span className="badge badge-gray">{territory.group}</span>
                    </td>
                    <td>
                      <span className="tech-tag">
                        {getTypeLabel(territory.type)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(territory.status)}`}>
                        {getStatusLabel(territory.status)}
                      </span>
                    </td>
                    <td>{territory.visits}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {/* Trabalhar - versão autenticada */}
                        <button 
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Trabalhar no território (login necessário)"
                          onClick={() => navigate(`/territories/${territory.id}/worker`)}
                        >
                          <PlayCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </button>
                        
                        {/* Compartilhar - link público */}
                        <button 
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Compartilhar publicamente (sem login)"
                          onClick={() => handleSharePublic(territory)}
                        >
                          <Share2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </button>
                        
                        {/* Visualizar */}
                        <button 
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Visualizar detalhes"
                          onClick={() => setSelectedTerritory(territory)}
                        >
                          <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        
                        {/* Editar */}
                        <button 
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Editar território"
                        >
                          <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[var(--text-muted)]">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    Nenhum território encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumo */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-sm text-[var(--text-muted)]">
        <span>
          Mostrando <strong>{filteredTerritories.length}</strong> de <strong>{territories.length}</strong> territórios
        </span>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Disponível
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Designado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Em Andamento
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Concluído
          </span>
        </div>
      </div>

      {/* Ações em massa */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition-all duration-200 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Território
        </button>
        <button className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Importar KML
        </button>
        <button className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Legenda dos botões */}
      <div className="mt-4 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-muted)] flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4 text-green-600" />
            Trabalhar (login)
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-4 h-4 text-blue-500" />
            Compartilhar (público)
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-[var(--text-muted)]" />
            Visualizar
          </span>
          <span className="flex items-center gap-1">
            <Edit className="w-4 h-4 text-[var(--text-muted)]" />
            Editar
          </span>
        </p>
      </div>
    </div>
  );
};

export default TerritoriesPage;