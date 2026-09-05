import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, MapPin, Check, X, 
  ChevronRight, ChevronLeft, Filter, Search,
  Bell, BellOff, RefreshCw, Users, Mic,
  Home, Church, Video, Users as UsersIcon,
  Plus, Edit, Trash2, Eye, BookOpen, Coffee, Layout,
  UserCheck, AlertCircle, List, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

interface Designation {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'president' | 'mic' | 'hospitality' | 'stage' | 'public_talk' | 'cleaning' | 'field_service';
  assignedTo: string;
  assignedToName: string;
  date: string;
  time?: string;
  location: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'assigned';
  notes?: string;
  congregation?: string;
}

const Designations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'completed' | 'assigned'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Verificar se é admin (nível de acesso admin)
  const isAdmin = user?.accessLevel === 'admin';

  useEffect(() => {
    // Dados mockados no estilo Hourglass
    const mockDesignations: Designation[] = [
      {
        id: '1',
        title: 'Leitor de A Sentinela',
        description: 'Leitura do artigo principal',
        type: 'reading',
        assignedTo: 'user1',
        assignedToName: 'Carlos Silva',
        date: '2026-11-04',
        time: '19:30',
        location: 'Salão do Reino',
        status: 'pending',
        notes: 'Artigo: "A importância da gratidão"'
      },
      {
        id: '2',
        title: 'Presidente',
        description: 'Reunião do fim de semana',
        type: 'president',
        assignedTo: 'user2',
        assignedToName: 'Maria Santos',
        date: '2026-11-18',
        time: '10:00',
        location: 'Salão do Reino',
        status: 'accepted'
      },
      {
        id: '3',
        title: 'Microfone Volante',
        description: 'Mic 1 - Auxiliar',
        type: 'mic',
        assignedTo: 'user3',
        assignedToName: 'João Oliveira',
        date: '2026-11-18',
        time: '10:00',
        location: 'Salão do Reino',
        status: 'accepted'
      },
      {
        id: '4',
        title: 'Hospitalidade',
        description: 'Preparar café e recepção',
        type: 'hospitality',
        assignedTo: 'user4',
        assignedToName: 'Ana Costa',
        date: '2026-11-25',
        time: '09:30',
        location: 'Salão do Reino',
        status: 'pending'
      },
      {
        id: '5',
        title: 'Palco',
        description: 'Auxílio no palco',
        type: 'stage',
        assignedTo: 'user5',
        assignedToName: 'Pedro Lima',
        date: '2026-12-02',
        time: '10:00',
        location: 'Salão do Reino',
        status: 'pending'
      },
      {
        id: '6',
        title: 'Reunião para o Serviço de Campo',
        description: 'Coordenação de grupos',
        type: 'field_service',
        assignedTo: 'user1',
        assignedToName: 'Carlos Silva',
        date: '2026-11-08',
        time: '10:15',
        location: 'Salão do Reino',
        status: 'assigned'
      },
      {
        id: '7',
        title: 'Oração final',
        description: 'Oração de encerramento',
        type: 'president',
        assignedTo: 'user6',
        assignedToName: 'Juscelino Campos',
        date: '2026-11-13',
        time: '20:30',
        location: 'Salão do Reino',
        status: 'declined'
      }
    ];
    setDesignations(mockDesignations);
    setLoading(false);
  }, []);

  const filteredDesignations = designations.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'declined': return 'Recusado';
      case 'completed': return 'Concluído';
      case 'assigned': return 'Designado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'accepted': return <Check className="w-3.5 h-3.5" />;
      case 'declined': return <X className="w-3.5 h-3.5" />;
      case 'completed': return <Check className="w-3.5 h-3.5" />;
      case 'assigned': return <UserCheck className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'president': return <UsersIcon className="w-4 h-4" />;
      case 'mic': return <Mic className="w-4 h-4" />;
      case 'hospitality': return <Coffee className="w-4 h-4" />;
      case 'stage': return <Layout className="w-4 h-4" />;
      case 'public_talk': return <UsersIcon className="w-4 h-4" />;
      case 'cleaning': return <Home className="w-4 h-4" />;
      case 'field_service': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reading': return 'Leitura';
      case 'president': return 'Presidente';
      case 'mic': return 'Microfone';
      case 'hospitality': return 'Hospitalidade';
      case 'stage': return 'Palco';
      case 'public_talk': return 'Discurso Público';
      case 'cleaning': return 'Limpeza';
      case 'field_service': return 'Serviço de Campo';
      default: return type;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const isPastDate = (dateStr: string) => {
    return isPast(parseISO(dateStr));
  };

  const handleAccept = (id: string) => {
    setDesignations(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'accepted' } : d
    ));
  };

  const handleDecline = (id: string) => {
    setDesignations(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'declined' } : d
    ));
  };

  const handleAssign = (id: string) => {
    setDesignations(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'assigned' } : d
    ));
    alert('✅ Designação atribuída com sucesso!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Designações</h1>
          <p className="text-[rgb(var(--foreground))] opacity-70 text-sm">
            Gerencie as designações da congregação
            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              {filteredDesignations.length} encontradas
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all text-sm font-medium flex items-center gap-2"
          >
            {viewMode === 'list' ? <Calendar className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {viewMode === 'list' ? 'Calendário' : 'Lista'}
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Designação
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 border border-[rgb(var(--border))]'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            filter === 'pending' 
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' 
              : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 border border-[rgb(var(--border))]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pendentes
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            filter === 'accepted' 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
              : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 border border-[rgb(var(--border))]'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Aceitos
        </button>
        <button
          onClick={() => setFilter('declined')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            filter === 'declined' 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
              : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 border border-[rgb(var(--border))]'
          }`}
        >
          <X className="w-3.5 h-3.5" />
          Recusados
        </button>
        <button
          onClick={() => setFilter('assigned')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            filter === 'assigned' 
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
              : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 border border-[rgb(var(--border))]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Designados
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            filter === 'completed' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 border border-[rgb(var(--border))]'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Concluídos
        </button>
      </div>

      {/* Lista de Designações */}
      <div className="space-y-3">
        {filteredDesignations.map((designation) => (
          <div 
            key={designation.id} 
            className={`bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] overflow-hidden hover:shadow-md transition-all ${
              isPastDate(designation.date) && designation.status === 'pending' ? 'border-red-300 dark:border-red-800' : ''
            }`}
          >
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Esquerda - Informações principais */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-[rgb(var(--foreground))] opacity-70">
                    {formatDate(designation.date)}
                  </span>
                  {isPastDate(designation.date) && designation.status === 'pending' && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      Atrasado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-blue-600 dark:text-blue-400">
                    {getTypeIcon(designation.type)}
                  </span>
                  <h3 className="font-semibold text-[rgb(var(--foreground))]">
                    {designation.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300`}>
                    {getTypeLabel(designation.type)}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--foreground))] opacity-80 mt-0.5">{designation.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[rgb(var(--foreground))] opacity-60">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {designation.assignedToName}
                  </span>
                  {designation.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {designation.time}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {designation.location}
                  </span>
                </div>
              </div>

              {/* Direita - Status e Ações */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(designation.status)}`}>
                  {getStatusIcon(designation.status)}
                  {getStatusLabel(designation.status)}
                </span>

                {designation.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleAssign(designation.id)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Designar
                      </button>
                    )}
                    <button
                      onClick={() => handleAccept(designation.id)}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleDecline(designation.id)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Recusar
                    </button>
                  </div>
                )}

                {designation.status !== 'pending' && (
                  <button
                    onClick={() => navigate(`/designations/${designation.id}`)}
                    className="p-1.5 text-[rgb(var(--foreground))] opacity-40 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há designações */}
      {filteredDesignations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-[rgb(var(--foreground))]">Nenhuma designação encontrada</h3>
          <p className="text-sm text-[rgb(var(--foreground))] opacity-60 mt-1">Não há designações com o filtro selecionado.</p>
        </div>
      )}

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[rgb(var(--foreground))] opacity-70">
          Mostrando {filteredDesignations.length} de {designations.length} designações
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

export default Designations;