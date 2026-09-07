import React, { useState } from 'react';
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  FileCheck,
  AlertCircle,
  User,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface Designation {
  id: string;
  territoryNumber: number;
  territoryName: string;
  assignedTo: string;
  assignedDate: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  notes?: string;
}

const Designations: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dados mockados
  const designations: Designation[] = [
    {
      id: '1',
      territoryNumber: 1,
      territoryName: 'Condomínio Aripuãna',
      assignedTo: 'João Silva',
      assignedDate: '2026-09-01',
      status: 'pending'
    },
    {
      id: '2',
      territoryNumber: 2,
      territoryName: 'Serra do Cipó',
      assignedTo: 'Maria Santos',
      assignedDate: '2026-08-28',
      status: 'in_progress'
    },
    {
      id: '3',
      territoryNumber: 3,
      territoryName: 'Praça do Externato',
      assignedTo: 'Pedro Oliveira',
      assignedDate: '2026-08-25',
      status: 'completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-yellow',
      accepted: 'badge-blue',
      in_progress: 'badge-blue',
      completed: 'badge-green',
      rejected: 'badge-red'
    };
    return map[status] || 'badge-gray';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pendente',
      accepted: 'Aceito',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      rejected: 'Recusado'
    };
    return map[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      in_progress: <RefreshCw className="w-4 h-4" />,
      completed: <FileCheck className="w-4 h-4" />,
      rejected: <AlertCircle className="w-4 h-4" />
    };
    return map[status] || <AlertCircle className="w-4 h-4" />;
  };

  const statuses = ['Todos', 'Pendente', 'Aceito', 'Em Andamento', 'Concluído', 'Recusado'];

  const filteredDesignations = designations.filter(d => {
    const matchSearch = d.territoryName.toLowerCase().includes(search.toLowerCase()) ||
                        d.territoryNumber.toString().includes(search);
    const matchStatus = filterStatus === '' || filterStatus === 'Todos' || d.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="header mb-8 text-center border-b-2 border-[var(--border-color)] pb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3">
          <ClipboardList className="w-8 h-8 text-[#1a3c6e] dark:text-blue-400" />
          Designações
        </h1>
        <p className="text-[var(--text-muted)] text-base mt-1">
          Gerencie as designações de territórios da congregação
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por território..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Território</th>
              <th>Designado para</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDesignations.length > 0 ? (
              filteredDesignations.map((designation) => (
                <tr key={designation.id} className="hover:bg-[var(--bg-hover)] transition">
                  <td>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="font-medium">#{designation.territoryNumber}</span>
                      <span className="text-[var(--text-muted)]">-</span>
                      <span>{designation.territoryName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--text-muted)]" />
                      {designation.assignedTo}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                      {new Date(designation.assignedDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(designation.status)} flex items-center gap-1`}>
                      {getStatusIcon(designation.status)}
                      {getStatusLabel(designation.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition" title="Visualizar">
                        <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                      <button className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition" title="Editar">
                        <Edit className="w-4 h-4 text-[var(--text-muted)]" />
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
                <td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  Nenhuma designação encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition-all duration-200 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Designação
        </button>
        <button className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2">
          <FileCheck className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Resumo */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
        <span>
          Mostrando <strong>{filteredDesignations.length}</strong> de <strong>{designations.length}</strong> designações
        </span>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> Pendente
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Aceito
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Em Andamento
          </span>
          <span className="flex items-center gap-1">
            <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400" /> Concluído
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" /> Recusado
          </span>
        </div>
      </div>
    </div>
  );
};

export default Designations;