import React, { useState } from 'react';
import {
  Users,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  BadgeCheck,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Award
} from 'lucide-react';

interface Publisher {
  id: string;
  name: string;
  email: string;
  phone: string;
  congregation: string;
  privileges: string[];
  status: 'active' | 'inactive';
  joinDate: string;
}

const Congregation: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dados mockados
  const publishers: Publisher[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(21) 99999-9999',
      congregation: 'Congregação Central',
      privileges: ['publisher', 'elder'],
      status: 'active',
      joinDate: '2020-01-15'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(21) 99999-9998',
      congregation: 'Congregação Central',
      privileges: ['publisher', 'ministerial'],
      status: 'active',
      joinDate: '2021-03-10'
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro@email.com',
      phone: '(21) 99999-9997',
      congregation: 'Congregação Central',
      privileges: ['publisher'],
      status: 'active',
      joinDate: '2022-06-20'
    }
  ];

  const getPrivilegeIcon = (privilege: string) => {
    const map: Record<string, React.ReactNode> = {
      publisher: <User className="w-4 h-4" />,
      pioneer: <Award className="w-4 h-4" />,
      ministerial: <Shield className="w-4 h-4" />,
      elder: <BadgeCheck className="w-4 h-4" />
    };
    return map[privilege] || <User className="w-4 h-4" />;
  };

  const getPrivilegeLabel = (privilege: string) => {
    const map: Record<string, string> = {
      publisher: 'Publicador',
      pioneer: 'Pioneiro',
      ministerial: 'Servo Ministerial',
      elder: 'Ancião'
    };
    return map[privilege] || privilege;
  };

  const statuses = ['Todos', 'Ativo', 'Inativo'];

  const filteredPublishers = publishers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === '' || filterStatus === 'Todos' || 
                        (filterStatus === 'Ativo' ? p.status === 'active' : p.status === 'inactive');
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="header mb-8 text-center border-b-2 border-[var(--border-color)] pb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-[#1a3c6e] dark:text-blue-400" />
          Congregação
        </h1>
        <p className="text-[var(--text-muted)] text-base mt-1">
          Gerencie os publicadores da congregação
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
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
              <th>Publicador</th>
              <th>Contato</th>
              <th>Privilégios</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPublishers.length > 0 ? (
              filteredPublishers.map((publisher) => (
                <tr key={publisher.id} className="hover:bg-[var(--bg-hover)] transition">
                  <td>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--text-muted)]" />
                      <div>
                        <div className="font-medium">{publisher.name}</div>
                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {publisher.congregation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                        {publisher.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-[var(--text-muted)]" />
                        {publisher.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {publisher.privileges.map((priv) => (
                        <span key={priv} className="tech-tag flex items-center gap-1">
                          {getPrivilegeIcon(priv)}
                          {getPrivilegeLabel(priv)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${publisher.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                      {publisher.status === 'active' ? 'Ativo' : 'Inativo'}
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
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  Nenhum publicador encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition-all duration-200 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Publicador
        </button>
        <button className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Importar Lista
        </button>
      </div>

      {/* Resumo */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
        <span>
          Mostrando <strong>{filteredPublishers.length}</strong> de <strong>{publishers.length}</strong> publicadores
        </span>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" /> Ativos
          </span>
          <span className="flex items-center gap-1">
            <UserX className="w-4 h-4 text-red-600 dark:text-red-400" /> Inativos
          </span>
        </div>
      </div>
    </div>
  );
};

export default Congregation;