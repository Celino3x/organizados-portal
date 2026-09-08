import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  Download,
  Printer,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  User,
  Music,
  MapPin,
  Home,
  BookOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  Heart,
  Save,
  UserPlus
} from 'lucide-react';
import api from '../services/api';

interface Meeting {
  id: number;
  date: string;
  semana: string;
  texto_biblia: string;
  data_reuniao: string;
  congregacao: string;
  presidente_id?: number;
  presidente_nome?: string;
  canticos_inicial?: number;
  canticos_meio?: number;
  canticos_final?: number;
  oracao_inicial_id?: number;
  oracao_inicial_nome?: string;
  oracao_final_id?: number;
  oracao_final_nome?: string;
  partes_json: string;
  created_at: string;
  updated_at: string;
}

const MeetingDesignations: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedMeetings, setSelectedMeetings] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Anos disponíveis (últimos 5 + próximo 2)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);
  
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      let url = '/designations/meetings';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedYear) params.append('year', String(selectedYear));
      if (selectedMonth) params.append('month', String(selectedMonth));
      
      const query = params.toString();
      const response = await api.get(`${url}${query ? '?' + query : ''}`);
      setMeetings(response.data);
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [search, selectedYear, selectedMonth]);

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
      fetchMeetings();
      setShowUploadModal(false);
    } catch (error: any) {
      alert('❌ Erro ao importar arquivo: ' + (error.response?.data?.error || 'Erro desconhecido'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta reunião?')) return;

    try {
      await api.delete(`/designations/meetings/${id}`);
      fetchMeetings();
    } catch (error) {
      alert('❌ Erro ao excluir reunião');
    }
  };

  const toggleSelectAll = () => {
    if (selectedMeetings.length === meetings.length) {
      setSelectedMeetings([]);
    } else {
      setSelectedMeetings(meetings.map(m => m.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedMeetings(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getPartesCount = (partesJson: string) => {
    try {
      const partes = JSON.parse(partesJson);
      return Array.isArray(partes) ? partes.length : 0;
    } catch {
      return 0;
    }
  };

  const getMonthName = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return months[date.getMonth()]?.label || '';
  };

  const getYear = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear();
  };

  // Tabs do submenu
  const tabs = [
    { path: '/designations/meetings', label: '📋 Reunião Vida e Ministério' },
    { path: '/designations', label: '📌 Todas as Designações' },
  ];

  return (
    <div className="pb-8">
      {/* Submenu de Designações */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--border-color)] pb-3">
        {tabs.map((tab) => {
          const isActive = window.location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm md:text-base ${
                isActive
                  ? 'bg-[#1a3c6e] text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Header com botão Nova Reunião */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#1a3c6e] dark:text-blue-400" />
            Reunião Vida e Ministério
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)]">
            Gerencie as designações das reuniões Vida e Ministério
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm"
          >
            <Upload className="w-4 h-4" />
            Importar RTF
          </button>
          <button
            onClick={() => navigate('/designations/meetings/create')}
            className="px-4 py-2 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Reunião
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por semana, texto bíblico ou data..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
            <button
              onClick={fetchMeetings}
              className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                className="pl-3 pr-8 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] appearance-none"
              >
                <option value="">Todos os anos</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                className="pl-3 pr-8 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] appearance-none"
              >
                <option value="">Todos os meses</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            <button
              onClick={() => {
                setSearch('');
                setSelectedYear(null);
                setSelectedMonth(null);
              }}
              className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition text-sm"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-muted)]">Carregando...</div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">Nenhuma reunião encontrada</p>
          <p className="text-sm text-[var(--text-muted)]">Importe um arquivo RTF ou crie uma nova reunião</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Importar RTF
            </button>
            <button
              onClick={() => navigate('/designations/meetings/create')}
              className="px-4 py-2 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Reunião
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Controles de seleção */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                {selectedMeetings.length === meetings.length ? 'Desselecionar todas' : 'Selecionar todas'}
              </button>
              <span className="text-sm text-[var(--text-muted)]">
                {selectedMeetings.length} selecionada(s)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={selectedMeetings.length === 0}
                className="px-4 py-2 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition disabled:opacity-50 text-sm flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Visualizar selecionadas
              </button>
            </div>
          </div>

          {/* Lista de reuniões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`card p-4 md:p-5 hover:shadow-lg transition ${
                  selectedMeetings.includes(meeting.id) ? 'border-2 border-[#1a3c6e]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMeetings.includes(meeting.id)}
                    onChange={() => toggleSelect(meeting.id)}
                    className="mt-1 w-4 h-4 rounded border-[var(--border-color)] text-[#1a3c6e] focus:ring-[#1a3c6e]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {meeting.semana || 'Semana não definida'}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Visualizar"
                          onClick={() => navigate(`/designations/meeting/${meeting.id}`)}
                        >
                          <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-[var(--bg-hover)] rounded-lg transition"
                          title="Editar"
                          onClick={() => navigate(`/designations/meeting/${meeting.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Excluir"
                          onClick={() => handleDelete(meeting.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(meeting.data_reuniao)}
                        </span>
                        {getMonthName(meeting.data_reuniao) && (
                          <span className="badge badge-blue text-xs">
                            {getMonthName(meeting.data_reuniao)}
                          </span>
                        )}
                        {getYear(meeting.data_reuniao) && (
                          <span className="badge badge-gray text-xs">
                            {getYear(meeting.data_reuniao)}
                          </span>
                        )}
                      </div>
                      {meeting.texto_biblia && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {meeting.texto_biblia}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {getPartesCount(meeting.partes_json)} partes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="mt-4 text-sm text-[var(--text-muted)] text-center">
            Mostrando <strong>{meetings.length}</strong> reuniões
          </div>
        </>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1a3c6e]" />
                Importar RTF
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Selecione um arquivo RTF da apostila da reunião para importar automaticamente as designações.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center hover:border-[#1a3c6e] transition">
                <input
                  type="file"
                  accept=".rtf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full cursor-pointer"
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Arquivos .rtf da apostila
                </p>
              </div>
              {uploading && (
                <div className="text-center text-[var(--text-muted)]">
                  Processando...
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDesignations;