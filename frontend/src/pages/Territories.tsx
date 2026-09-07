import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Home,
  Building,
  Store,
  CheckCircle,
  Clock,
  RefreshCw,
  FileCheck,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info
} from 'lucide-react';

interface Territory {
  id: string;
  number: number;
  name: string;
  group: string;
  type: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed';
  visits: number;
}

const Territories: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [sortField, setSortField] = useState<keyof Territory>('number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const territories: Territory[] = [
    { id: '1', number: 1, name: 'Condomínio Aripuãna', group: 'Cosmos 1', type: 'condominium', status: 'available', visits: 0 },
    { id: '2', number: 2, name: 'Serra do Cipó/Alfredo de Assunção', group: 'Cosmos 1', type: 'residential', status: 'available', visits: 0 },
    { id: '3', number: 3, name: 'Serra do Cipó/Florentino Ávidos', group: 'Cosmos 2', type: 'residential', status: 'available', visits: 0 },
    { id: '4', number: 4, name: 'Serra do Cipó', group: 'Cosmos 2', type: 'residential', status: 'available', visits: 0 },
    { id: '5', number: 5, name: 'Praça do Externato', group: 'Cosmos 2', type: 'mixed', status: 'available', visits: 0 },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: 'badge-green',
      assigned: 'badge-yellow',
      in_progress: 'badge-blue',
      completed: 'badge-purple'
    };
    return map[status] || 'badge-gray';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      available: 'Disponível',
      assigned: 'Designado',
      in_progress: 'Em Andamento',
      completed: 'Concluído'
    };
    return map[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      available: <CheckCircle className="w-4 h-4" />,
      assigned: <Clock className="w-4 h-4" />,
      in_progress: <RefreshCw className="w-4 h-4" />,
      completed: <FileCheck className="w-4 h-4" />
    };
    return map[status] || <AlertCircle className="w-4 h-4" />;
  };

  const getTypeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      residential: <Home className="w-4 h-4" />,
      commercial: <Store className="w-4 h-4" />,
      mixed: <Building className="w-4 h-4" />,
      condominium: <Building className="w-4 h-4" />
    };
    return map[type] || <Home className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      residential: 'Residencial',
      commercial: 'Comercial',
      mixed: 'Misto',
      condominium: 'Condomínio'
    };
    return map[type] || type;
  };

  const groups = ['Todos', 'Cosmos 1', 'Cosmos 2', 'Cosmos 3', 'Cosmos 4', 'Icurana 1', 'Icurana 2', 'Vilar Guanabara 1', 'Vilar Guanabara 2'];

  const handleSort = (field: keyof Territory) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredTerritories = territories
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.number.toString().includes(search);
      const matchGroup = filterGroup === '' || filterGroup === 'Todos' || t.group === filterGroup;
      return matchSearch && matchGroup;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <div>
      <div className="header mb-8 text-center border-b-2 border-[#e6ecf5] dark:border-[#334155] pb-6">
        <h1 className="text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight flex items-center justify-center gap-3">
          <MapPin className="w-8 h-8" />
          Territórios
        </h1>
        <p className="text-[#64748b] dark:text-gray-400 text-base mt-1">
          Gerencie os 64 territórios da congregação
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Buscar por nome ou número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ecf5] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[#e6ecf5] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="cursor-pointer hover:bg-[#e6ecf5] transition" onClick={() => handleSort('number')}>
                <div className="flex items-center gap-1">
                  #
                  {sortField === 'number' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="cursor-pointer hover:bg-[#e6ecf5] transition" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Nome
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="cursor-pointer hover:bg-[#e6ecf5] transition" onClick={() => handleSort('group')}>
                <div className="flex items-center gap-1">
                  Grupo
                  {sortField === 'group' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Visitas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTerritories.length > 0 ? (
              filteredTerritories.map((territory) => (
                <tr key={territory.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition">
                  <td className="font-mono font-bold text-[#1a3c6e] dark:text-blue-400">
                    {territory.number}
                  </td>
                  <td className="font-medium">{territory.name}</td>
                  <td>
                    <span className="badge badge-gray">{territory.group}</span>
                  </td>
                  <td>
                    <span className="tech-tag flex items-center gap-1">
                      {getTypeIcon(territory.type)}
                      {getTypeLabel(territory.type)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(territory.status)} flex items-center gap-1`}>
                      {getStatusIcon(territory.status)}
                      {getStatusLabel(territory.status)}
                    </span>
                  </td>
                  <td>{territory.visits}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-[#f1f5f9] dark:hover:bg-[#334155] rounded-lg transition" title="Visualizar">
                        <Eye className="w-4 h-4 text-[#64748b]" />
                      </button>
                      <button className="p-1.5 hover:bg-[#f1f5f9] dark:hover:bg-[#334155] rounded-lg transition" title="Editar">
                        <Edit className="w-4 h-4 text-[#64748b]" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Excluir">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[#64748b] dark:text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  Nenhum território encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-sm text-[#64748b] dark:text-gray-400">
        <span>
          Mostrando <strong>{filteredTerritories.length}</strong> de <strong>{territories.length}</strong> territórios
        </span>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-600" /> Disponível
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-yellow-600" /> Designado
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw className="w-4 h-4 text-blue-600" /> Em Andamento
          </span>
          <span className="flex items-center gap-1">
            <FileCheck className="w-4 h-4 text-purple-600" /> Concluído
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition-all duration-200 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Território
        </button>
        <button className="px-6 py-2.5 border border-[#e6ecf5] dark:border-[#334155] text-[#0f172a] dark:text-white rounded-xl font-medium hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-all duration-200 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Importar KML
        </button>
        <button className="px-6 py-2.5 border border-[#e6ecf5] dark:border-[#334155] text-[#0f172a] dark:text-white rounded-xl font-medium hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-all duration-200 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Exportar
        </button>
      </div>
    </div>
  );
};

export default Territories;