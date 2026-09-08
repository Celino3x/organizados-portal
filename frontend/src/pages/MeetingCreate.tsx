import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Clock,
  Music,
  BookOpen,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft
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
  const [selectedWeek, setSelectedWeek] = useState<WeekTemplate | null>(null);
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [dataReuniao, setDataReuniao] = useState('');
  const [congregacao, setCongregacao] = useState('VILAR GUANABARA');
  const [loading, setLoading] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Buscar semanas disponíveis
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await api.get('/designations/weeks');
        setWeeks(response.data);
      } catch (error) {
        console.error('Erro ao buscar semanas:', error);
      } finally {
        setLoadingWeeks(false);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };
    
    fetchWeeks();
    fetchUsers();
    
    // Data padrão = próxima terça
    const hoje = new Date();
    const d = new Date(hoje);
    const delta = (2 - hoje.getDay() + 7) % 7;
    d.setDate(hoje.getDate() + (delta === 0 ? 7 : delta));
    setDataReuniao(d.toISOString().split('T')[0]);
  }, []);

  // Carregar template da semana selecionada
  const handleWeekSelect = (weekId: number) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    
    setSelectedWeek(week);
    
    // Inicializar designações a partir das partes
    const partes = week.partes_json || [];
    const initialDesignacoes: Designacao[] = partes.map((parte: any) => ({
      id: `parte-${parte.numero}-${Date.now()}`,
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

  const handleSave = async () => {
    if (!selectedWeek) {
      alert('Selecione uma semana primeiro');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        semana_id: selectedWeek.id,
        data_reuniao: dataReuniao,
        congregacao: congregacao,
        designacoes: designacoes.map(d => ({
          id: d.id,
          publicador_id: d.publicador_id || null,
          publicador_nome: d.publicador_nome || '',
          ajudante_id: d.ajudante_id || null,
          ajudante_nome: d.ajudante_nome || ''
        }))
      };

      await api.post('/designations/meetings', payload);
      alert('✅ Reunião criada com sucesso!');
      navigate('/designations/meetings');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao criar reunião');
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
            Incluir Reunião
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Selecione a semana e designe os publicadores
          </p>
        </div>
      </div>

      {/* Seleção da Semana */}
      <div className="card p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Período da Semana *
            </label>
            <select
              value={selectedWeek?.id || ''}
              onChange={(e) => handleWeekSelect(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            >
              <option value="">Selecione uma semana</option>
              {weeks.map(week => (
                <option key={week.id} value={week.id}>
                  {week.periodo_textual} / {week.ano}
                </option>
              ))}
            </select>
            {loadingWeeks && (
              <div className="text-sm text-[var(--text-muted)] mt-1">Carregando semanas...</div>
            )}
            {weeks.length === 0 && !loadingWeeks && (
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
      </div>

      {/* Cânticos e informações da semana */}
      {selectedWeek && (
        <div className="card p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Cântico Abertura</span>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {selectedWeek.cantico_abertura || '—'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Cântico Meio</span>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {selectedWeek.cantico_meio || '—'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Cântico Final</span>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {selectedWeek.cantico_final || '—'}
              </p>
            </div>
          </div>
          {selectedWeek.texto_biblia && (
            <div className="mt-3 text-sm text-[var(--text-muted)]">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Texto da Bíblia: {selectedWeek.texto_biblia}
            </div>
          )}
        </div>
      )}

      {/* Designações */}
      {selectedWeek && designacoes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Designar Publicadores
          </h2>

          {Object.entries(groupedDesignacoes).map(([secao, partes]) => (
            <div key={secao} className="card p-4 md:p-6 border-l-4 border-blue-200 dark:border-blue-800">
              <h3 className="text-md font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <span className="text-xl">{getSeccaoIcon(secao)}</span>
                {secao}
              </h3>
              <div className="space-y-3">
                {partes.map((parte, index) => {
                  const globalIndex = designacoes.findIndex(d => d.id === parte.id);
                  return (
                    <div key={parte.id} className="flex flex-col md:flex-row gap-3 p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                      <div className="flex-1 min-w-[120px]">
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
                            const userId = parseInt(e.target.value);
                            const user = users.find(u => u.id === userId);
                            updateDesignacao(globalIndex, 'publicador_id', userId || undefined);
                            updateDesignacao(globalIndex, 'publicador_nome', user?.name || '');
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                        >
                          <option value="">Selecione</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} {user.privileges?.includes('elder') ? '👑' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Ajudante apenas para partes do ministério */}
                      {(secao.includes('Ministério') || secao.includes('Ministerio')) && (
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Ajudante
                          </label>
                          <select
                            value={parte.ajudante_id || ''}
                            onChange={(e) => {
                              const userId = parseInt(e.target.value);
                              const user = users.find(u => u.id === userId);
                              updateDesignacao(globalIndex, 'ajudante_id', userId || undefined);
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