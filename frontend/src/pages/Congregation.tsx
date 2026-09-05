import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, 
  UserPlus, Mail, Phone, MapPin,
  ChevronRight, ChevronLeft, UserCircle,
  CheckCircle, Clock, AlertCircle,
  Edit, Trash2, Eye, Loader2,
  Shield, UserCog
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Publisher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cellphone?: string;
  address?: string;
  group?: string;
  role: string;
  accessLevel: 'viewer' | 'support' | 'admin';
  privileges: string[];
  isActive: boolean;
  congregation: string;
  createdAt: string;
  updatedAt: string;
}

const Congregation: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se é admin
  const isAdmin = currentUser?.accessLevel === 'admin';
  const isSupport = currentUser?.accessLevel === 'support';

  // Carregar dados da API
  useEffect(() => {
    loadPublishers();
  }, []);

  const loadPublishers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      console.log('📥 Dados recebidos:', response.data);
      
      if (response.data.success) {
        setPublishers(response.data.users);
      } else {
        setError('Erro ao carregar publicadores');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar publicadores:', error);
      
      if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setError('Acesso negado. Você não tem permissão para ver a lista de publicadores.');
      } else {
        setError('Erro ao carregar publicadores. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPublishers = publishers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.email.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup === 'all' || p.group === filterGroup;
    const matchesRole = filterRole === 'all' || p.role === filterRole;
    return matchesSearch && matchesGroup && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'elder': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ministerial_servant': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'pioneer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'elder': return 'Ancião';
      case 'ministerial_servant': return 'Servo Ministerial';
      case 'pioneer': return 'Pioneiro';
      case 'publisher': return 'Publicador';
      default: return role;
    }
  };

  const getPrivilegeLabel = (privilege: string) => {
    switch (privilege) {
      case 'elder': return 'Ancião';
      case 'ministerial_servant': return 'Servo Ministerial';
      case 'pioneer': return 'Pioneiro';
      case 'publisher': return 'Publicador';
      default: return privilege;
    }
  };

  const getPrivilegeColor = (privilege: string) => {
    switch (privilege) {
      case 'elder': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ministerial_servant': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'pioneer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'publisher': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'admin': return 'Administrador';
      case 'support': return 'Apoio';
      case 'viewer': return 'Visualizar';
      default: return level;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'support': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert('❌ Apenas administradores podem excluir publicadores.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este publicador?')) {
      try {
        await api.delete(`/users/${id}`);
        setPublishers(publishers.filter(p => p.id !== id));
        alert('✅ Publicador excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('❌ Erro ao excluir publicador.');
      }
    }
  };

  // Verificar se o usuário pode editar
  const canEdit = (publisher: Publisher) => {
    if (isAdmin) return true;
    if (isSupport && publisher.id === currentUser?.id) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando publicadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{error}</p>
        <button
          onClick={loadPublishers}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Congregação</h1>
          <p className="text-[rgb(var(--foreground))] opacity-70 text-sm">
            Gerencie os publicadores da congregação
            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              {filteredPublishers.length} publicadores
            </span>
            {currentUser && (
              <span className="ml-2 text-xs text-[rgb(var(--foreground))] opacity-50">
                • {getAccessLevelLabel(currentUser.accessLevel)}
              </span>
            )}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/congregation/new')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Novo Publicador
          </button>
        )}
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--foreground))] opacity-40 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar publicador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--foreground))] placeholder:opacity-40"
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
        >
          <option value="all">Todos os grupos</option>
          <option value="Cosmos 1">Cosmos 1</option>
          <option value="Cosmos 2">Cosmos 2</option>
          <option value="Cosmos 3">Cosmos 3</option>
          <option value="Cosmos 4">Cosmos 4</option>
          <option value="Icurana 1">Icurana 1</option>
          <option value="Icurana 2">Icurana 2</option>
          <option value="Vilar Guanabara 1">Vilar Guanabara 1</option>
          <option value="Vilar Guanabara 2">Vilar Guanabara 2</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
        >
          <option value="all">Todas as funções</option>
          <option value="admin">Administrador</option>
          <option value="elder">Ancião</option>
          <option value="ministerial_servant">Servo Ministerial</option>
          <option value="pioneer">Pioneiro</option>
          <option value="publisher">Publicador</option>
        </select>
      </div>

      {/* Lista de Publicadores */}
      <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgb(var(--background))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Publicador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Função</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Privilégios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Acesso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {filteredPublishers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[rgb(var(--foreground))] opacity-60">
                    Nenhum publicador encontrado.
                  </td>
                </tr>
              ) : (
                filteredPublishers.map((publisher) => {
                  const isCurrentUser = publisher.id === currentUser?.id;
                  const canEditUser = canEdit(publisher);
                  
                  return (
                    <tr key={publisher.id} className="hover:bg-[rgb(var(--background))] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            publisher.isActive 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {publisher.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {publisher.name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-xs text-blue-600 dark:text-blue-400">(você)</span>
                              )}
                            </p>
                            <p className="text-xs text-[rgb(var(--foreground))] opacity-60">{publisher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">{publisher.group || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(publisher.role)}`}>
                          {getRoleLabel(publisher.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {publisher.privileges?.map((priv) => (
                            <span key={priv} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPrivilegeColor(priv)}`}>
                              {getPrivilegeLabel(priv)}
                            </span>
                          ))}
                          {(!publisher.privileges || publisher.privileges.length === 0) && (
                            <span className="text-xs text-[rgb(var(--foreground))] opacity-40">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(publisher.accessLevel)}`}>
                          {getAccessLevelLabel(publisher.accessLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          publisher.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {publisher.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {publisher.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEditUser ? (
                            <button
                              onClick={() => navigate(`/congregation/edit/${publisher.id}`)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isCurrentUser && !isAdmin
                                  ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                  : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                              }`}
                              title={isCurrentUser ? 'Editar meu perfil' : 'Editar'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="p-1.5 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded-lg"
                              title="Sem permissão para editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(publisher.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[rgb(var(--foreground))] opacity-70">
          Mostrando {filteredPublishers.length} de {publishers.length} publicadores
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--background))] transition-all disabled:opacity-50">
            <ChevronLeft className="w-4 h-4 text-[rgb(var(--foreground))] opacity-70" />
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
          <button className="p-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--background))] transition-all">
            <ChevronRight className="w-4 h-4 text-[rgb(var(--foreground))] opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Congregation;