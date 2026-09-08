import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  ChevronDown,
  User,
  Users,
  Clock,
  Music,
  BookOpen,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

interface WeekTemplate {
  id: number;
  periodo_textual: string;
  data_inicio: string;
  data_fim: string;
  ano: number;
  texto_biblia?: string;
  cantico_abertura?: number;
  cantico_meio?: number;
  cantico_final?: number;
  coment_iniciais_min: number;
  coment_finais_min: number;
  partes_json: any[];
}

interface User {
  id: number;
  name: string;
  email: string;
  gender: 'male' | 'female';
  privileges: string[];
}

interface Designacao {
  id: string;
  secao: string;
  numero: number;
  tema: string;
  minutos: number;
  publicador_id?: number;
  publicador_nome?: string;
  ajudante_id?: number;
  ajudante_nome?: string;
}

const MeetingCreate: React.FC = () => {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<WeekTemplate[]>([]);
  const [filteredWeeks, setFilteredWeeks] = useState<WeekTemplate[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [dataReuniao, setDataReuniao] = useState('');
  const [congregacao, setCongregacao] = useState('VILAR GUANABARA');
  const [loading, setLoading] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [presidente, setPresidente] = useState('');
  const [oracaoInicial, setOracaoInicial] = useState('');
  const [oracaoFinal, setOracaoFinal] = useState('');
  const [canticoInicial, setCanticoInicial] = useState<number | null>(null);
  const [canticoMeio, setCanticoMeio] = useState<number | null>(null);
  const [canticoFinal, setCanticoFinal] = useState<number | null>(null);
  const [comentIniciais, setComentIniciais] = useState(1);
  const [comentFinais, setComentFinais] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar semanas e usuários
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeksRes, usersRes] = await Promise.all([
          api.get('/designations/weeks'),
          api.get('/users')
        ]);
        setWeeks(weeksRes.data);
        setFilteredWeeks(weeksRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoadingWeeks(false);
      }
    };
    
    fetchData();

    // Data padrão = próxima terça
    const hoje = new Date();
    const d = new Date(hoje);
    const delta = (2 - hoje.getDay() + 7) % 7;
    d.setDate(hoje.getDate() + (delta === 0 ? 7 : delta));
    setDataReuniao(d.toISOString().split('T')[0]);

    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar semanas conforme digitação
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWeeks(weeks);
      return;
    }
    const term = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtered = weeks.filter(week => {
      const textual = week.periodo_textual.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const ano = String(week.ano);
      return textual.includes(term) || ano.includes(term);
    });
    setFilteredWeeks(filtered);
  }, [searchTerm, weeks]);

  // Carregar template da semana selecionada
  const handleWeekSelect = (week: WeekTemplate) => {
    setSelectedWeek(week);
    setSearchTerm(`${week.periodo_textual} / ${week.ano}`);
    setShowDropdown(false);
    
    // Preencher cânticos
    setCanticoInicial(week.cantico_abertura || null);
    setCanticoMeio(week.cantico_meio || null);
    setCanticoFinal(week.cantico_final || null);
    setComentIniciais(week.coment_iniciais_min || 1);
    setComentFinais(week.coment_finais_min || 3);
    
    // Inicializar designações a partir das partes
    const partes = week.partes_json || [];
    const initialDesignacoes: Designacao[] = partes.map((parte: any) => ({
      id: `parte-${parte.numero}-${Date.now()}-${Math.random()}`,
      secao: parte.secao || 'Tesouros da Palavra de Deus',
      numero: parte.numero || 0,
      tema: parte.tema || '',
      minutos: parte.minutos || 0,
      publicador_id: undefined,
      publicador_nome: '',
      ajudante_id: undefined,
      ajudante_nome: ''
    }));
    setDesignacoes(initialDesignacoes);
  };

  const updateDesignacao = (index: number, field: string, value: any) => {
    const updated = [...designacoes];
    updated[index] = { ...updated[index], [field]: value };
    setDesignacoes(updated);
  };

  const addMinisterioPart = () => {
    const newPart: Designacao = {
      id: `parte-nova-${Date.now()}`,
      secao: 'Faça seu melhor no ministério',
      numero: designacoes.length + 1,
      tema: 'Nova parte',
      minutos: 5,
      publicador_id: undefined,
      publicador_nome: '',
      ajudante_id: undefined,
      ajudante_nome: ''
    };
    setDesignacoes([...designacoes, newPart]);
  };

  const removePart = (index: number) => {
    setDesignacoes(designacoes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedWeek) {
      alert('Selecione uma semana primeiro');
      return;
    }

    if (!dataReuniao) {
      alert('Selecione a data da reunião');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        semana_id: selectedWeek.id,
        data_reuniao: dataReuniao,
        congregacao: congregacao,
        presidente: presidente,
        oracao_inicial: oracaoInicial,
        oracao_final: oracaoFinal,
        cantico_inicial: canticoInicial,
        cantico_meio: canticoMeio,
        cantico_final: canticoFinal,
        coment_iniciais: comentIniciais,
        coment_finais: comentFinais,
        designacoes: designacoes.map(d => ({
          id: d.id,
          secao: d.secao,
          numero: d.numero,
          tema: d.tema,
          minutos: d.minutos,
          publicador_id: d.publicador_id || null,
          publicador_nome: d.publicador_nome || '',
          ajudante_id: d.ajudante_id || null,
          ajudante_nome: d.ajudante_nome || ''
        }))
      };

      await api.post('/designations/meetings', payload);
      alert('✅ Reunião criada com sucesso!');
      navigate('/designations/meetings');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao criar reunião: ' + (error.response?.data?.error || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Agrupar designações por seção
  const groupedDesignacoes = designacoes.reduce((acc, d) => {
    const secao = d.secao || 'Tesouros da Palavra de Deus';
    if (!acc[secao]) acc[secao] = [];
    acc[secao].push(d);
    return acc;
  }, {} as Record<string, Designacao[]>);

  const getSeccaoIcon = (secao: string) => {
    if (secao.includes('Tesouros')) return '📖';
    if (secao.includes('Ministério') || secao.includes('Ministerio')) return '🗣️';
    if (secao.includes('Vida Cristã') || secao.includes('Vida Crista')) return '🙏';
    return '📌';
  };

  return (
    <div className="pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/designations/meetings')}
          className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1a3c6e]" />
            Cadastrar Reunião — Vida e Ministério
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Selecione a semana para preencher automaticamente. Ajuste os designados e salve.
          </p>
        </div>
      </div>

      {/* Seleção da Semana - com Autocomplete */}
      <div className="card p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Período da Semana *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Digite para buscar (ex.: MARÇO, 2026 ou 15–21)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setSelectedWeek(null);
                    setDesignacoes([]);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 pr-10 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            </div>
            
            {/* Dropdown de semanas */}
            {showDropdown && filteredWeeks.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-[var(--border-color)] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredWeeks.map((week) => (
                  <button
                    key={week.id}
                    onClick={() => handleWeekSelect(week)}
                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-hover)] transition flex items-center justify-between"
                  >
                    <span className="text-[var(--text-primary)]">{week.periodo_textual}</span>
                    <span className="text-xs text-[var(--text-muted)]">{week.ano}</span>
                  </button>
                ))}
              </div>
            )}

            {loadingWeeks && (
              <div className="text-sm text-[var(--text-muted)] mt-1 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Carregando semanas...
              </div>
            )}

            {!loadingWeeks && weeks.length === 0 && (
              <div className="text-sm text-yellow-600 mt-1">
                ⚠️ Nenhuma semana importada. Importe um RTF primeiro.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Data da Reunião *
            </label>
            <input
              type="date"
              value={dataReuniao}
              onChange={(e) => setDataReuniao(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            />
          </div>
        </div>

        {/* Informações adicionais quando semana selecionada */}
        {selectedWeek && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Texto da Bíblia</span>
              <p className="text-[var(--text-primary)]">{selectedWeek.texto_biblia || '—'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Congregação</span>
              <input
                type="text"
                value={congregacao}
                onChange={(e) => setCongregacao(e.target.value)}
                className="w-full px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Comentários Iniciais</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={comentIniciais}
                  onChange={(e) => setComentIniciais(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
                <span className="text-[var(--text-muted)]">min</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cânticos */}
      {selectedWeek && (
        <div className="card p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Cântico Abertura
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={canticoInicial || ''}
                onChange={(e) => setCanticoInicial(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                placeholder="Nº"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Cântico Meio
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={canticoMeio || ''}
                onChange={(e) => setCanticoMeio(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                placeholder="Nº"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Cântico Final
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={canticoFinal || ''}
                onChange={(e) => setCanticoFinal(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                placeholder="Nº"
              />
            </div>
          </div>
        </div>
      )}

      {/* Designações */}
      {selectedWeek && designacoes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-5 h-5" />
              Designar Publicadores
            </h2>
            <button
              onClick={addMinisterioPart}
              className="px-4 py-2 text-sm bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Parte ao Ministério
            </button>
          </div>

          {Object.entries(groupedDesignacoes).map(([secao, partes]) => (
            <div key={secao} className="card p-4 md:p-6 border-l-4 border-blue-200 dark:border-blue-800">
              <h3 className="text-md font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <span className="text-xl">{getSeccaoIcon(secao)}</span>
                {secao}
              </h3>
              <div className="space-y-3">
                {partes.map((parte, idx) => {
                  const globalIndex = designacoes.findIndex(d => d.id === parte.id);
                  return (
                    <div key={parte.id} className="flex flex-col md:flex-row gap-3 p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] relative">
                      <button
                        onClick={() => removePart(globalIndex)}
                        className="absolute top-2 right-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-500"
                        title="Remover parte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex-1 min-w-[120px] pr-8">
                        <div className="font-medium text-[var(--text-primary)]">
                          {parte.numero}. {parte.tema}
                        </div>
                        <div className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {parte.minutos} min
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                          Designado
                        </label>
                        <select
                          value={parte.publicador_id || ''}
                          onChange={(e) => {
                            const userId = e.target.value ? parseInt(e.target.value) : undefined;
                            const user = users.find(u => u.id === userId);
                            updateDesignacao(globalIndex, 'publicador_id', userId);
                            updateDesignacao(globalIndex, 'publicador_nome', user?.name || '');
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                        >
                          <option value="">Selecione</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} {user.privileges?.includes('elder') ? '👑' : user.privileges?.includes('ministerial') ? '⚜️' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(secao.includes('Ministério') || secao.includes('Ministerio')) && (
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Ajudante
                          </label>
                          <select
                            value={parte.ajudante_id || ''}
                            onChange={(e) => {
                              const userId = e.target.value ? parseInt(e.target.value) : undefined;
                              const user = users.find(u => u.id === userId);
                              updateDesignacao(globalIndex, 'ajudante_id', userId);
                              updateDesignacao(globalIndex, 'ajudante_nome', user?.name || '');
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                          >
                            <option value="">Sem ajudante</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={() => navigate('/designations/meetings')}
              className="px-6 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-[#1a3c6e] text-white rounded-xl font-medium hover:bg-[#153058] transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Reunião
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCreate;