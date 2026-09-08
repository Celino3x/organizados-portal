import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  Upload, 
  Download, 
  Printer,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Clock,
  Music,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Save,
  UserPlus,
  UserCheck
} from 'lucide-react';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  congregation: string;
  gender: 'male' | 'female';
  privileges: string[];
}

interface Designation {
  id: number;
  date: string;
  meetingType: string;
  section: string;
  partNumber: string;
  partName: string;
  speaker: string;
  speakerId?: number;
  assistant?: string;
  assistantId?: number;
  time?: string;
  song?: string;
  order: number;
  notes?: string;
}

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

const Designations: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [formData, setFormData] = useState<Partial<Designation>>({});
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedField, setSelectedField] = useState<'speaker' | 'assistant'>('speaker');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/designations/by-date/${selectedDate}`);
      const data = response.data;
      
      if (data && data.designs && Array.isArray(data.designs)) {
        setDesignations(data.designs);
      } else if (Array.isArray(data)) {
        setDesignations(data);
      } else {
        setDesignations([]);
      }
    } catch (error) {
      console.error('Erro ao buscar designações:', error);
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchUsers();
  }, [selectedDate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/designations/import-rtf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`✅ ${response.data.count} designações importadas com sucesso!`);
      fetchDesignations();
    } catch (error: any) {
      alert('❌ Erro ao importar arquivo: ' + (error.response?.data?.error || 'Erro desconhecido'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta designação?')) return;

    try {
      await api.delete(`/designations/${id}`);
      fetchDesignations();
    } catch (error) {
      alert('❌ Erro ao excluir designação');
    }
  };

  const openEditModal = (designation: Designation) => {
    setEditingDesignation(designation);
    setFormData({ ...designation });
    setIsModalOpen(true);
    setFormError('');
  };

  const handleSaveDesignation = async () => {
    if (!editingDesignation) return;
    
    setFormLoading(true);
    setFormError('');

    try {
      await api.put(`/designations/${editingDesignation.id}`, formData);
      setIsModalOpen(false);
      setEditingDesignation(null);
      fetchDesignations();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Erro ao salvar designação');
    } finally {
      setFormLoading(false);
    }
  };

  const openUserModal = (field: 'speaker' | 'assistant') => {
    setSelectedField(field);
    setUserSearch('');
    setIsUserModalOpen(true);
  };

  const selectUser = (user: User) => {
    if (selectedField === 'speaker') {
      setFormData({ ...formData, speaker: user.name, speakerId: user.id });
    } else {
      setFormData({ ...formData, assistant: user.name, assistantId: user.id });
    }
    setIsUserModalOpen(false);
  };

  const getSectionIcon = (section: string) => {
    const map: Record<string, string> = {
      'Tesouros da Palavra de Deus': '📖',
      'Faça seu melhor no ministério': '🗣️',
      'Nossa vida cristã': '🙏'
    };
    return map[section] || '📌';
  };

  const getSectionColor = (section: string) => {
    const map: Record<string, string> = {
      'Tesouros da Palavra de Deus': 'border-blue-200 dark:border-blue-800',
      'Faça seu melhor no ministério': 'border-green-200 dark:border-green-800',
      'Nossa vida cristã': 'border-purple-200 dark:border-purple-800'
    };
    return map[section] || 'border-gray-200';
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const groupedDesignations = designations.reduce((acc, d) => {
    if (!acc[d.section]) acc[d.section] = [];
    acc[d.section].push(d);
    return acc;
  }, {} as Record<string, Designation[]>);

  const displayDate = new Date(selectedDate);
  const formattedDate = displayDate.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="header mb-6 text-center border-b-2 border-[var(--border-color)] pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3">
          <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-[#1a3c6e] dark:text-blue-400" />
          Designações
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] mt-1">
          Gerencie as designações das reuniões
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
        <div className="flex-1 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 md:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer px-4 py-2 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            {uploading ? 'Importando...' : 'Importar RTF'}
            <input
              type="file"
              accept=".rtf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Programa da Reunião */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-muted)]">Carregando...</div>
        </div>
      ) : designations.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">Nenhuma designação para esta data</p>
          <p className="text-sm text-[var(--text-muted)]">Importe um arquivo RTF ou crie manualmente</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Data */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {formattedDate}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Reunião Vida e Ministério</p>
          </div>

          {/* Partes por seção */}
          {Object.entries(groupedDesignations).map(([section, parts]) => (
            <div key={section} className={`card p-4 md:p-6 border-l-4 ${getSectionColor(section)}`}>
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <span className="text-2xl">{getSectionIcon(section)}</span>
                {section}
              </h3>
              <div className="space-y-3">
                {parts.map((part) => (
                  <div 
                    key={part.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] hover:border-[#bfdbfe] transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#1a3c6e] dark:text-blue-400">
                          {part.partNumber}.
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {part.partName}
                        </span>
                        {part.time && (
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {part.time}
                          </span>
                        )}
                        {part.song && (
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            Cântico {part.song}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <User className="w-3 h-3" />
                          {part.speaker || 'Não designado'}
                          {part.speakerId && (
                            <span className="text-xs text-[var(--text-muted)]">(ID: {part.speakerId})</span>
                          )}
                        </span>
                        {part.assistant && (
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Users className="w-3 h-3" />
                            Ajudante: {part.assistant}
                            {part.assistantId && (
                              <span className="text-xs text-[var(--text-muted)]">(ID: {part.assistantId})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button 
                        className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                        onClick={() => openEditModal(part)}
                        title="Editar designação"
                      >
                        <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        onClick={() => handleDelete(part.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição com Designação */}
      {isModalOpen && editingDesignation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#1a3c6e]" />
                Editar Designação
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={(e) => { e.preventDefault(); handleSaveDesignation(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Nome da Parte
                </label>
                <input
                  type="text"
                  value={formData.partName || ''}
                  onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Designado
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.speaker || ''}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value, speakerId: undefined })}
                    className="flex-1 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    placeholder="Nome do irmão/irmã"
                  />
                  <button
                    type="button"
                    onClick={() => openUserModal('speaker')}
                    className="px-3 py-2 bg-[#1a3c6e] text-white rounded-xl hover:bg-[#153058] transition flex items-center gap-1"
                    title="Selecionar da lista"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Ajudante (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.assistant || ''}
                    onChange={(e) => setFormData({ ...formData, assistant: e.target.value, assistantId: undefined })}
                    className="flex-1 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    placeholder="Nome do ajudante"
                  />
                  <button
                    type="button"
                    onClick={() => openUserModal('assistant')}
                    className="px-3 py-2 bg-[#1a3c6e] text-white rounded-xl hover:bg-[#153058] transition flex items-center gap-1"
                    title="Selecionar da lista"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Tempo
                  </label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    placeholder="10 min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Cântico
                  </label>
                  <input
                    type="text"
                    value={formData.song || ''}
                    onChange={(e) => setFormData({ ...formData, song: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                    placeholder="Nº do cântico"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Usuário */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1a3c6e]" />
                Selecionar {selectedField === 'speaker' ? 'Designado' : 'Ajudante'}
              </h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-[var(--text-muted)]">
                  Nenhum usuário encontrado
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition flex items-center gap-2"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${user.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{user.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                    </div>
                    <div className="ml-auto text-xs text-[var(--text-muted)]">
                      {user.privileges.includes('elder') && '👑 '}
                      {user.privileges.includes('ministerial') && '⚜️ '}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designations;