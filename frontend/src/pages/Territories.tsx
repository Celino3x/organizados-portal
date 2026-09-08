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
  Share2
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
        prompt('Copie o link abaixo para compartilhar:', url);
      });
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="header mb-4 md:mb-8 text-center border-b-2 border-[var(--border-color)] pb-3 md:pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-2 md:gap-3">
          <MapPin className="w-6 h-6 md:w-8 md:h-8 text-[#1a3c6e] dark:text-blue-400" />
          Territórios
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] mt-1">
          Gerencie os {territories.length} territórios da congregação
        </p>
      </div>

      {/* Stats - Scroll horizontal em mobile */}
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-5 md:gap-4">
        {[
          { label: 'Total', value: stats.total, color: '' },
          { label: 'Disponíveis', value: stats.available, color: 'border-green-200 dark:border-green-800' },
          { label: 'Designados', value: stats.assigned, color: 'border-yellow-200 dark:border-yellow-800' },
          { label: 'Em Andamento', value: stats.inProgress, color: 'border-blue-200 dark:border-blue-800' },
          { label: 'Concluídos', value: stats.completed, color: 'border-purple-200 dark:border-purple-800' }
        ].map((stat, idx) => (
          <div key={idx} className={`card text-center flex-shrink-0 w-24 md:w-auto p-3 md:p-4 ${stat.color}`}>
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
            <div className="text-[10px] md:text-xs text-[var(--text-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros - Empilhados em mobile */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 md:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition"
          />
        </div>
        <div className="relative flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="pl-9 pr-7 py-2 md:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none w-full sm:w-auto"
          >
            <option value="">Grupo</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="relative flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-7 py-2 md:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none w-full sm:w-auto"
          >
            <option value="">Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 md:p-2.5 rounded-xl border transition ${
              viewMode === 'list' 
                ? 'bg-[#1a3c6e] text-white border-[#1a3c6e]' 
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <List className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 md:p-2.5 rounded-xl border transition ${
              viewMode === 'map' 
                ? 'bg-[#1a3c6e] text-white border-[#1a3c6e]' 
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Tabela com scroll horizontal em mobile */}
      {viewMode === 'map' ? (
        <div className="mb-6">
          <div className="h-[300px] md:h-[500px]">
            <TerritoryMap territories={filteredTerritories} />
          </div>
          <div className="mt-2 text-sm text-[var(--text-muted)] text-center">
            Mostrando {filteredTerritories.length} de {territories.length} territórios
          </div>
        </div>
      ) : (
        <div className="table-wrap overflow-x-auto">
          <table className="min-w-[600px] md:min-w-full">
            <thead>
              <tr>
                <th className="text-xs md:text-sm">#</th>
                <th className="text-xs md:text-sm">Nome</th>
                <th className="text-xs md:text-sm hidden sm:table-cell">Grupo</th>
                <th className="text-xs md:text-sm hidden md:table-cell">Tipo</th>
                <th className="text-xs md:text-sm">Status</th>
                <th className="text-xs md:text-sm hidden sm:table-cell">Visitas</th>
                <th className="text-xs md:text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTerritories.length > 0 ? (
                filteredTerritories.map((territory) => (
                  <tr key={territory.id} className="hover:bg-[var(--bg-hover)] transition">
                    <td className="font-mono font-bold text-[#1a3c6e] dark:text-blue-400 text-xs md:text-sm">
                      {territory.number}
                    </td>
                    <td className="text-xs md:text-sm font-medium truncate max-w-[80px] md:max-w-none">
                      {territory.name}
                    </td>
                    <td className="text-xs md:text-sm hidden sm:table-cell">
                      <span className="badge badge-gray text-[10px] md:text-xs">{territory.group}</span>
                    </td>
                    <td className="text-xs md:text-sm hidden md:table-cell">
                      <span className="tech-tag text-[10px] md:text-xs">
                        {getTypeLabel(territory.type)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(territory.status)} text-[10px] md:text-xs`}>
                        {getStatusLabel(territory.status)}
                      </span>
                    </td>
                    <td className="text-xs md:text-sm hidden sm:table-cell">{territory.visits}</td>
                    <td>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <button 
                          className="p-1 md:p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Trabalhar"
                          onClick={() => navigate(`/territories/${territory.id}/worker`)}
                        >
                          <PlayCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                        </button>
                        <button 
                          className="p-1 md:p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Compartilhar"
                          onClick={() => handleSharePublic(territory)}
                        >
                          <Share2 className="w-3 h-3 md:w-4 md:h-4 text-blue-500 dark:text-blue-400" />
                        </button>
                        <button 
                          className="p-1 md:p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Visualizar"
                          onClick={() => setSelectedTerritory(territory)}
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4 text-[var(--text-muted)]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 md:py-8 text-[var(--text-muted)]">
                    <Search className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-50" />
                    <p className="text-sm md:text-base">Nenhum território encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumo - Responsivo */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 md:gap-4 mt-3 md:mt-4 text-xs md:text-sm text-[var(--text-muted)]">
        <span>
          Mostrando <strong>{filteredTerritories.length}</strong> de <strong>{territories.length}</strong> territórios
        </span>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 inline-block"></span>
            <span className="text-[10px] md:text-xs">Disponível</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 inline-block"></span>
            <span className="text-[10px] md:text-xs">Designado</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500 inline-block"></span>
            <span className="text-[10px] md:text-xs">Em Andamento</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-purple-500 inline-block"></span>
            <span className="text-[10px] md:text-xs">Concluído</span>
          </span>
        </div>
      </div>

      {/* Ações - Empilhadas em mobile */}
      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3">
        <button className="px-4 md:px-6 py-2 md:py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition-all duration-200 flex items-center gap-2 text-sm md:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Novo</span>
        </button>
        <button className="px-4 md:px-6 py-2 md:py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2 text-sm md:text-base">
          <Download className="w-4 h-4" />
          <span className="hidden xs:inline">Importar</span>
        </button>
        <button className="px-4 md:px-6 py-2 md:py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2 text-sm md:text-base">
          <Upload className="w-4 h-4" />
          <span className="hidden xs:inline">Exportar</span>
        </button>
      </div>
    </div>
  );
};

export default TerritoriesPage;