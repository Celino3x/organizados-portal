import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Navigation, Share2, CheckCircle, 
  Clock, AlertCircle, Play, StopCircle,
  Calendar, Phone, Mail, MessageCircle,
  Loader2, ExternalLink, ArrowLeft,
  Check, X, FileText, User, Home, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Territory {
  id: string;
  number: number;
  name: string;
  group: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'assigned' | 'in_progress' | 'completed';
  visits: number;
  imageUrl?: string;
}

interface TerritorySession {
  id: string;
  territoryId: string;
  publisherId: string;
  publisherName: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending_review';
  notes?: string;
}

const TerritoryWorker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [session, setSession] = useState<TerritorySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [results, setResults] = useState({
    visited: 0,
    notHome: 0,
    studied: 0,
    returnVisits: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [extendHours, setExtendHours] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadData();
    checkPermissions();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simular dados - substituir por chamada real à API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTerritory: Territory = {
        id: id || '1',
        number: 1,
        name: 'Condomínio Aripuãna',
        group: 'Cosmos 1',
        type: 'condominium',
        address: 'Rua das Flores, 100 - Cosmos',
        latitude: -22.914794,
        longitude: -43.616536,
        status: 'available',
        visits: 0,
        imageUrl: '/territorio/1.png'
      };
      setTerritory(mockTerritory);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      setIsAdmin(user?.accessLevel === 'admin');
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  };

  const handleStartTerritory = async () => {
    if (!user) {
      alert('🔐 Faça login para iniciar um território');
      navigate('/login');
      return;
    }

    try {
      // Simular início
      const mockSession: TerritorySession = {
        id: 'session1',
        territoryId: territory?.id || '',
        publisherId: user.id,
        publisherName: user.name,
        startTime: new Date().toISOString(),
        duration: 120,
        status: 'active'
      };
      setSession(mockSession);
      setTimeLeft(120);
      
      alert('✅ Território iniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao iniciar:', error);
      alert('❌ Erro ao iniciar território. Tente novamente.');
    }
  };

  const handleCompleteTerritory = async () => {
    try {
      setSession(null);
      setTimeLeft(null);
      setShowCompleteModal(false);
      
      alert('✅ Território concluído com sucesso!');
      navigate('/territories');
    } catch (error) {
      console.error('Erro ao concluir:', error);
      alert('❌ Erro ao concluir território. Tente novamente.');
    }
  };

  const handleExtendTerritory = async () => {
    try {
      setTimeLeft(timeLeft! + extendHours * 60);
      setShowExtendModal(false);
      alert(`✅ Território prorrogado por ${extendHours} hora(s)!`);
    } catch (error) {
      console.error('Erro ao prorrogar:', error);
      alert('❌ Erro ao prorrogar território. Tente novamente.');
    }
  };

  const handleCloseByAdmin = async (date: string) => {
    if (!isAdmin) return;
    
    try {
      alert('✅ Território fechado com sucesso!');
      navigate('/territories');
    } catch (error) {
      console.error('Erro ao fechar:', error);
      alert('❌ Erro ao fechar território. Tente novamente.');
    }
  };

  const sendReminder = () => {
    if (!user?.phone) {
      alert('📱 Número de telefone não cadastrado. Adicione no seu perfil.');
      return;
    }
    
    const message = 
      `⏰ *LEMBRETE: Território em andamento*\n\n` +
      `📍 *Território:* ${territory?.name} (#${territory?.number})\n` +
      `👤 *Responsável:* ${user?.name}\n` +
      `⏳ *Tempo em andamento:* ${session ? Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000) : 0} minutos\n\n` +
      `🔗 *Acompanhe:* ${window.location.href}\n\n` +
      `⚠️ *Não deixe de comunicar e finalizar o território.*\n\n` +
      `📱 *Portal Organizados*`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getWhatsAppMessage = () => {
    if (!territory) return '';
    const link = `${window.location.origin}/territory/${territory.id}/worker`;
    return `📍 *TERRITÓRIO ${territory.number} - ${territory.name}*\n\n` +
      `📌 *Número:* ${territory.number}\n` +
      `📍 *Localidade:* ${territory.name}\n` +
      `👥 *Grupo:* ${territory.group}\n` +
      `📋 *Tipo:* ${territory.type}\n\n` +
      `🗺️ *Localização:* https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17\n\n` +
      `🔗 *Link para trabalhar o território:*\n${link}\n\n` +
      `📱 *Abra no celular para:*\n` +
      `• Ver a localização exata no mapa\n` +
      `• Iniciar o território\n` +
      `• Concluir com relatório\n` +
      `• Compartilhar localização\n\n` +
      `⚠️ *Não deixe de comunicar e finalizar o território.*\n\n` +
      `📱 *Compartilhado via Portal Organizados*`;
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getWhatsAppMessage())}`, '_blank');
  };

  const handleNavigate = () => {
    if (!territory) return;
    window.open(
      `https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17`,
      '_blank'
    );
  };

  // Timer
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (session?.status === 'active') {
            alert('⏰ O tempo de 2 horas acabou! Por favor, informe se o território foi concluído.');
            setShowCompleteModal(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [timeLeft, session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'assigned': return 'Designado';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando território...</p>
        </div>
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-slate-900 p-4">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Território não encontrado</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">O território que você procura não existe.</p>
        <button
          onClick={() => navigate('/territories')}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Território #{territory.number}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(territory.status)}`}>
              {getStatusLabel(territory.status)}
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Timer - Se estiver em andamento */}
        {session?.status === 'active' && timeLeft !== null && timeLeft > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    ⏳ Território em andamento
                  </p>
                  <p className={`text-2xl font-bold ${
                    timeLeft < 30 ? 'text-red-600 dark:text-red-400' :
                    timeLeft < 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-700 dark:text-blue-300'
                  }`}>
                    {Math.floor(timeLeft / 60)}h {Math.floor(timeLeft % 60)}min
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={sendReminder}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                >
                  <Bell className="w-4 h-4" />
                  Lembrete
                </button>
                <button
                  onClick={() => setShowExtendModal(true)}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                >
                  <Clock className="w-4 h-4" />
                  Prorrogar
                </button>
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Concluir
                </button>
              </div>
            </div>
            <div className="mt-3 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  timeLeft < 30 ? 'bg-red-500' :
                  timeLeft < 60 ? 'bg-yellow-500' :
                  'bg-blue-600'
                }`}
                style={{ width: `${(timeLeft / 120) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card do Território */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Mapa com iframe do Google Maps */}
          <div className="relative h-[300px] bg-gray-100 dark:bg-slate-700">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${territory.latitude},${territory.longitude}&zoom=17&maptype=roadmap`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Território ${territory.number}`}
            />
            
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Território #{territory.number}
                </h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(territory.status)}`}>
                  {getStatusLabel(territory.status)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{territory.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Grupo</p>
                <p className="font-medium text-gray-800 dark:text-white">{territory.group}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                <p className="font-medium text-gray-800 dark:text-white capitalize">{territory.type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Endereço</p>
                <p className="font-medium text-gray-800 dark:text-white text-sm">{territory.address}</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
              {territory.status === 'available' && (
                <button
                  onClick={handleStartTerritory}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20"
                >
                  <Play className="w-4 h-4" />
                  Iniciar Território
                </button>
              )}

              {territory.status === 'in_progress' && session?.status === 'active' && (
                <>
                  <button
                    onClick={handleNavigate}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Navigation className="w-4 h-4" />
                    Navegar
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                </>
              )}

              {territory.status === 'available' && (
                <button
                  onClick={handleNavigate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                  <Navigation className="w-4 h-4" />
                  Ver no Mapa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={() => window.open(`mailto:?subject=Território ${territory.number}&body=${encodeURIComponent(getWhatsAppMessage())}`, '_blank')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <Mail className="w-4 h-4" />
            E-mail
          </button>
        </div>

        {/* Admin: Fechar com data retroativa */}
        {isAdmin && territory.status === 'in_progress' && (
          <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-blue-600" />
              Admin - Fechar Território
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="datetime-local"
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                defaultValue={new Date().toISOString().slice(0, 16)}
                id="adminCloseDate"
              />
              <button
                onClick={() => {
                  const date = (document.getElementById('adminCloseDate') as HTMLInputElement)?.value;
                  if (date && window.confirm(`Fechar território com data: ${new Date(date).toLocaleString('pt-BR')}?`)) {
                    handleCloseByAdmin(date);
                  }
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Fechar Território
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ⚠️ Selecione a data e hora em que o território foi concluído.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Conclusão */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                ✅ Concluir Território
              </h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Preencha os resultados do trabalho de campo:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visitas realizadas
                </label>
                <input
                  type="number"
                  min="0"
                  value={results.visited}
                  onChange={(e) => setResults({ ...results, visited: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Não encontrados
                </label>
                <input
                  type="number"
                  min="0"
                  value={results.notHome}
                  onChange={(e) => setResults({ ...results, notHome: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estudos realizados
                </label>
                <input
                  type="number"
                  min="0"
                  value={results.studied}
                  onChange={(e) => setResults({ ...results, studied: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Revisitas marcadas
                </label>
                <input
                  type="number"
                  min="0"
                  value={results.returnVisits}
                  onChange={(e) => setResults({ ...results, returnVisits: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Alguma observação sobre o território?"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteTerritory}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prorrogação */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                ⏰ Prorrogar Território
              </h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Quantas horas extras você precisa para concluir este território?
            </p>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setExtendHours(hours)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    extendHours === hours
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Motivo da prorrogação (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Ex: Território grande, muitas visitas..."
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleExtendTerritory}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Prorrogar {extendHours}h
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryWorker;