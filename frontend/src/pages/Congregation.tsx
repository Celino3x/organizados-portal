import React, { useState, useEffect, useMemo } from 'react';
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
  Award,
  X,
  Check,
  Save,
  AlertCircle,
  Calendar,
  Home,
  Smartphone,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Interface do usuário
interface UserData {
  id: number;
  name: string;
  email: string;
  congregation: string;
  phone?: string;
  cellphone?: string;
  address?: string;
  birthDate?: string;
  baptismDate?: string;
  class?: string;
  gender: 'male' | 'female';
  accessLevel: 'viewer' | 'support' | 'admin';
  privileges: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para criação/edição
interface UserFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  congregation: string;
  phone?: string;
  cellphone?: string;
  address?: string;
  birthDate?: string;
  baptismDate?: string;
  class?: string;
  gender: 'male' | 'female';
  accessLevel: 'viewer' | 'support' | 'admin';
  privileges: string[];
  isActive: boolean;
}

const Congregation: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAccess, setFilterAccess] = useState('');
  const [filterActive, setFilterActive] = useState('');
  
  // Modal de criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    congregation: '',
    phone: '',
    cellphone: '',
    address: '',
    birthDate: '',
    baptismDate: '',
    class: 'Outras Ovelhas',
    gender: 'male',
    accessLevel: 'viewer',
    privileges: ['publisher'],
    isActive: true
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Privilégios disponíveis
  const availablePrivileges = [
    { value: 'publisher', label: '📖 Publicador' },
    { value: 'pioneer', label: '🚀 Pioneiro' },
    { value: 'ministerial', label: '⚜️ Servo Ministerial' },
    { value: 'elder', label: '👑 Ancião' }
  ];

  // Níveis de acesso
  const accessLevels = [
    { value: 'viewer', label: '👁️ Visualizador' },
    { value: 'support', label: '🛠️ Apoio' },
    { value: 'admin', label: '👑 Administrador' }
  ];

  // Classes disponíveis
  const classes = [
    'Outras Ovelhas',
    'Ungido'
  ];

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtros
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
      const matchAccess = filterAccess === '' || filterAccess === 'Todos' || u.accessLevel === filterAccess;
      const matchActive = filterActive === '' || filterActive === 'Todos' ||
                          (filterActive === 'Ativo' ? u.isActive : !u.isActive);
      return matchSearch && matchAccess && matchActive;
    });
  }, [users, search, filterAccess, filterActive]);

  // Estatísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admin: users.filter(u => u.accessLevel === 'admin').length,
    support: users.filter(u => u.accessLevel === 'support').length,
    viewer: users.filter(u => u.accessLevel === 'viewer').length
  };

  // Abrir modal para criar/editar
  const openModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        congregation: user.congregation,
        phone: user.phone || '',
        cellphone: user.cellphone || '',
        address: user.address || '',
        birthDate: user.birthDate || '',
        baptismDate: user.baptismDate || '',
        class: user.class || 'Outras Ovelhas',
        gender: user.gender,
        accessLevel: user.accessLevel,
        privileges: user.privileges,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        congregation: '',
        phone: '',
        cellphone: '',
        address: '',
        birthDate: '',
        baptismDate: '',
        class: 'Outras Ovelhas',
        gender: 'male',
        accessLevel: 'viewer',
        privileges: ['publisher'],
        isActive: true
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormError('');
  };

  // Atualizar campo do formulário
  const handleFormChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Alternar privilégio
  const togglePrivilege = (privilege: string) => {
    setFormData(prev => {
      const current = prev.privileges;
      const newPrivileges = current.includes(privilege)
        ? current.filter(p => p !== privilege)
        : [...current, privilege];
      return { ...prev, privileges: newPrivileges };
    });
  };

  // Salvar usuário
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.email || !formData.congregation) {
        setFormError('Nome, email e congregação são obrigatórios');
        setFormLoading(false);
        return;
      }

      // Validar senha para novo usuário
      if (!editingUser && !formData.password) {
        setFormError('Senha é obrigatória para novo usuário');
        setFormLoading(false);
        return;
      }

      // Validar confirmação de senha
      if (formData.password && formData.password !== formData.confirmPassword) {
        setFormError('As senhas não coincidem');
        setFormLoading(false);
        return;
      }

      // Validar privilégios para mulheres
      if (formData.gender === 'female') {
        const invalidPrivileges = ['ministerial', 'elder'];
        const hasInvalid = formData.privileges.some(p => invalidPrivileges.includes(p));
        if (hasInvalid) {
          setFormError('Mulheres não podem ser designadas como Servos Ministeriais ou Anciãos');
          setFormLoading(false);
          return;
        }
      }

      const payload: any = {
        name: formData.name,
        email: formData.email,
        congregation: formData.congregation,
        phone: formData.phone || null,
        cellphone: formData.cellphone || null,
        address: formData.address || null,
        birthDate: formData.birthDate || null,
        baptismDate: formData.baptismDate || null,
        class: formData.class || 'Outras Ovelhas',
        gender: formData.gender,
        accessLevel: formData.accessLevel,
        privileges: formData.privileges,
        isActive: formData.isActive
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', payload);
      }

      closeModal();
      fetchUsers();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  // Excluir usuário
  const handleDelete = async (user: UserData) => {
    if (user.id === currentUser?.id) {
      alert('Você não pode excluir seu próprio usuário');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (error) {
      alert('Erro ao excluir usuário');
    }
  };

  // Alternar status do usuário (Ativar/Inativar)
  const toggleActive = async (user: UserData) => {
    if (user.id === currentUser?.id) {
      alert('Você não pode inativar seu próprio usuário');
      return;
    }

    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (error) {
      alert('Erro ao alterar status do usuário');
    }
  };

  // Obter label do privilégio
  const getPrivilegeLabel = (privilege: string) => {
    const map: Record<string, string> = {
      publisher: 'Publicador',
      pioneer: 'Pioneiro',
      ministerial: 'Servo Ministerial',
      elder: 'Ancião'
    };
    return map[privilege] || privilege;
  };

  // Obter ícone do privilégio
  const getPrivilegeIcon = (privilege: string) => {
    const map: Record<string, React.ReactNode> = {
      publisher: <User className="w-3 h-3" />,
      pioneer: <Award className="w-3 h-3" />,
      ministerial: <Shield className="w-3 h-3" />,
      elder: <BadgeCheck className="w-3 h-3" />
    };
    return map[privilege] || <User className="w-3 h-3" />;
  };

  // Verificar se o usuário atual é admin
  const isAdmin = currentUser?.accessLevel === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)] text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Acesso Restrito</p>
          <p className="text-sm">Apenas administradores podem acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header mb-8 text-center border-b-2 border-[var(--border-color)] pb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-[#1a3c6e] dark:text-blue-400" />
          Congregação
        </h1>
        <p className="text-[var(--text-muted)] text-base mt-1">
          Gerencie os publicadores da congregação
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</div>
          <div className="text-xs text-[var(--text-muted)]">Total</div>
        </div>
        <div className="card text-center border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
          <div className="text-xs text-[var(--text-muted)]">Ativos</div>
        </div>
        <div className="card text-center border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</div>
          <div className="text-xs text-[var(--text-muted)]">Inativos</div>
        </div>
        <div className="card text-center border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admin}</div>
          <div className="text-xs text-[var(--text-muted)]">Admins</div>
        </div>
        <div className="card text-center border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.support}</div>
          <div className="text-xs text-[var(--text-muted)]">Apoio</div>
        </div>
        <div className="card text-center border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.viewer}</div>
          <div className="text-xs text-[var(--text-muted)]">Visualizadores</div>
        </div>
      </div>

      {/* Filtros */}
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
            value={filterAccess}
            onChange={(e) => setFilterAccess(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            <option value="">Todos os níveis</option>
            <option value="admin">Administrador</option>
            <option value="support">Apoio</option>
            <option value="viewer">Visualizador</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Novo Publicador
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-muted)]">Carregando...</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Publicador</th>
                <th>Contato</th>
                <th>Classe</th>
                <th>Privilégios</th>
                <th>Nível</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-hover)] transition">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${user.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.congregation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-[var(--text-muted)]" />
                            {user.phone}
                          </div>
                        )}
                        {user.cellphone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Smartphone className="w-3 h-3 text-[var(--text-muted)]" />
                            {user.cellphone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="tech-tag">
                        {user.class || 'Outras Ovelhas'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {user.privileges.map((priv) => (
                          <span key={priv} className="tech-tag flex items-center gap-1">
                            {getPrivilegeIcon(priv)}
                            {getPrivilegeLabel(priv)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.accessLevel === 'admin' ? 'badge-purple' :
                        user.accessLevel === 'support' ? 'badge-blue' :
                        'badge-gray'
                      }`}>
                        {user.accessLevel === 'admin' ? '👑 Admin' :
                         user.accessLevel === 'support' ? '🛠️ Apoio' :
                         '👁️ Visualizador'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Editar"
                          onClick={() => openModal(user)}
                        >
                          <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title={user.isActive ? 'Inativar' : 'Ativar'}
                          onClick={() => toggleActive(user)}
                        >
                          {user.isActive ? (
                            <UserX className="w-4 h-4 text-red-500" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Excluir"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[var(--text-muted)]">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    Nenhum publicador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumo */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
        <span>
          Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> publicadores
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

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingUser ? '✏️ Editar Publicador' : '👤 Novo Publicador'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Seção: Dados Pessoais */}
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <UserIcon className="w-5 h-5" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Celular
                    </label>
                    <input
                      type="text"
                      value={formData.cellphone || ''}
                      onChange={(e) => handleFormChange('cellphone', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Congregação */}
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5" />
                  Informações da Congregação
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Congregação *
                    </label>
                    <input
                      type="text"
                      value={formData.congregation}
                      onChange={(e) => handleFormChange('congregation', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Classe
                    </label>
                    <select
                      value={formData.class || 'Outras Ovelhas'}
                      onChange={(e) => handleFormChange('class', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    >
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Sexo
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleFormChange('gender', e.target.value as any)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    >
                      <option value="male">👨 Masculino</option>
                      <option value="female">👩 Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => handleFormChange('birthDate', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Data de Batismo
                    </label>
                    <input
                      type="date"
                      value={formData.baptismDate || ''}
                      onChange={(e) => handleFormChange('baptismDate', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Privilégios */}
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5" />
                  Privilégios
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  ⚠️ Mulheres não podem ser designadas como Servos Ministeriais ou Anciãos
                </p>
                <div className="flex flex-wrap gap-2">
                  {availablePrivileges.map((priv) => {
                    const isSelected = formData.privileges.includes(priv.value);
                    const isDisabled = formData.gender === 'female' && 
                      (priv.value === 'ministerial' || priv.value === 'elder');
                    
                    return (
                      <button
                        key={priv.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => togglePrivilege(priv.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-[#1a3c6e] text-white dark:bg-blue-600'
                            : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {priv.label}
                        {isDisabled && ' 🔒'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seção: Nível de Acesso */}
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5" />
                  Permissão
                </h3>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Nível de Acesso
                  </label>
                  <select
                    value={formData.accessLevel}
                    onChange={(e) => handleFormChange('accessLevel', e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  >
                    {accessLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seção: Segurança */}
              <div className="border-b border-[var(--border-color)] pb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5" />
                  Segurança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                    </label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      required={!editingUser}
                      minLength={6}
                      placeholder={editingUser ? 'Digite a nova senha' : 'Digite a senha'}
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {editingUser ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword || ''}
                      onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                      placeholder="Digite a senha novamente"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleFormChange('isActive', e.target.value === 'active')}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                >
                  <option value="active">✅ Ativo</option>
                  <option value="inactive">❌ Inativo</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? 'Salvando...' : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingUser ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Congregation;