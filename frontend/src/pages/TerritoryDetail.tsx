import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Info, Copy, Eye, EyeOff, 
  Edit, Users, History, Trash2, Share2, 
  CheckCircle, AlertCircle, Building, 
  Home, Store, TreePine, Crosshair, 
  Maximize2, Minimize2, Compass, Plus, Minus,
  Link, Send, Phone, Mail, Calendar, Clock,
  ChevronRight, ChevronLeft, Navigation,
  MessageCircle
} from 'lucide-react';
import { getTerritoryById } from '../data/territories';
import { Territory } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Função para formatar coordenadas em graus
const formatCoordinates = (lat: number, lng: number) => {
  const latDir = lat < 0 ? 'S' : 'N';
  const lngDir = lng < 0 ? 'W' : 'E';
  const latAbs = Math.abs(lat);
  const lngAbs = Math.abs(lng);
  
  const latDeg = Math.floor(latAbs);
  const latMin = Math.floor((latAbs - latDeg) * 60);
  const latSec = ((latAbs - latDeg) * 60 - latMin) * 60;
  
  const lngDeg = Math.floor(lngAbs);
  const lngMin = Math.floor((lngAbs - lngDeg) * 60);
  const lngSec = ((lngAbs - lngDeg) * 60 - lngMin) * 60;
  
  return `${latDeg}°${latMin}'${latSec.toFixed(1)}"${latDir} ${lngDeg}°${lngMin}'${lngSec.toFixed(1)}"${lngDir}`;
};

const TerritoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPolygon, setShowPolygon] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadTerritory();
  }, [id]);

  const loadTerritory = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const found = getTerritoryById(id || '1');
      if (found) {
        setTerritory(found);
      } else {
        navigate('/territories');
      }
    } catch (error) {
      console.error('Erro ao carregar território:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!territory) return;
    
    const link = `${window.location.origin}/territory/${territory.id}/worker`;
    const message = 
      `📍 *TERRITÓRIO ${territory.number} - ${territory.name}*\n\n` +
      `📌 *Número:* ${territory.number}\n` +
      `📍 *Localidade:* ${territory.name}\n` +
      `👥 *Grupo:* ${territory.group}\n` +
      `📋 *Tipo:* ${getTypeLabel(territory.type)}\n` +
      `📏 *Área:* ${territory.area?.km2 || 0} km²\n\n` +
      `🗺️ *Mapa:* https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17\n\n` +
      `🔗 *Link para trabalhar:*\n${link}\n\n` +
      `⚠️ *Não deixe de comunicar e finalizar o território.*\n\n` +
      `📱 *Compartilhado via Portal Organizados*`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNavigate = () => {
    if (!territory) return;
    window.open(
      `https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17`,
      '_blank'
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Coordenada copiada!');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'condominium': return <Building className="w-4 h-4" />;
      case 'residential': return <Home className="w-4 h-4" />;
      case 'commercial': return <Store className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'condominium': return 'Condomínio';
      case 'residential': return 'Residencial';
      case 'commercial': return 'Comercial';
      case 'mixed': return 'Misto';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'assigned': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'assigned': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getWhatsAppMessage = () => {
    if (!territory) return '';
    const link = `${window.location.origin}/territory/${territory.id}/worker`;
    return `📍 *TERRITÓRIO ${territory.number} - ${territory.name}*\n\n` +
      `📌 *Número:* ${territory.number}\n` +
      `📍 *Localidade:* ${territory.name}\n` +
      `👥 *Grupo:* ${territory.group}\n` +
      `📋 *Tipo:* ${getTypeLabel(territory.type)}\n\n` +
      `🗺️ *Localização:* https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17\n\n` +
      `🔗 *Link para trabalhar:*\n${link}\n\n` +
      `⚠️ *Não deixe de comunicar e finalizar o território.*\n\n` +
      `📱 *Compartilhado via Portal Organizados*`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar ao Mapa</span>
              </button>
              <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">📖</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-white">Portal Organizados</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Detalhes do Território</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Território #{territory.number}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">{user?.name || 'Usuário'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Portal</a>
          <ChevronRight className="w-3 h-3" />
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Mapa de Territórios</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 dark:text-white font-medium">Território {territory.number} - {territory.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Mapa e Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card do Mapa */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden slide-in">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 dark:text-white">Localização do Território</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{territory.name} • {territory.group}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="px-3 py-1.5 bg-white/80 dark:bg-slate-700/80 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 transition-colors border border-gray-200 dark:border-slate-600 flex items-center gap-2"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    {isFullscreen ? 'Sair' : 'Tela cheia'}
                  </button>
                </div>
              </div>

              {/* Mapa */}
              <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[500px]'} bg-gray-100 dark:bg-slate-700 p-2`}>
                <div className="rounded-xl overflow-hidden h-full">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${territory.latitude},${territory.longitude}&zoom=17&maptype=roadmap`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Território ${territory.number}`}
                    className="rounded-xl"
                  />
                </div>

                {/* Controles do Mapa */}
                <div className="absolute right-6 top-6 flex flex-col gap-1 z-10">
                  <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                    <Minus className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                    <Compass className="w-4 h-4" />
                  </button>
                </div>

                {/* Legenda do Mapa */}
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-200 dark:border-slate-700 text-xs space-y-1.5 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 bg-blue-600/20 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-300">Território #{territory.number}</span>
                  </div>
                  {showPolygon && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 border-t-2 border-blue-600 border-dashed"></div>
                      <span className="text-gray-600 dark:text-gray-300">Polígono</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Ponto de partida</span>
                  </div>
                </div>
              </div>

              {/* Informações Rápidas abaixo do mapa */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Localidade</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{territory.name}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Grupo</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{territory.group}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      {getTypeIcon(territory.type)}
                      {getTypeLabel(territory.type)}
                    </span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`text-sm font-medium flex items-center justify-center gap-1 ${getStatusColor(territory.status)} px-2 py-0.5 rounded-full`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(territory.status)}`}></span>
                    {getStatusLabel(territory.status)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ações do Território */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={handleNavigate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Eye className="w-4 h-4" />
                  Ver no Google Maps
                </button>
                <button 
                  onClick={handleShare}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
                <button 
                  onClick={() => setShowPolygon(!showPolygon)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    showPolygon 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700' 
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {showPolygon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPolygon ? 'Ocultar Polígono' : 'Mostrar Polígono'}
                </button>
              </div>
              <button 
                onClick={() => navigate('/territories')}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Fechar
              </button>
            </div>
          </div>

          {/* Sidebar - Informações Detalhadas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de Informações */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Informações do Território
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Número</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">#{territory.number}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Localidade</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white text-right truncate max-w-[150px]">{territory.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Grupo</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{territory.group}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tipo</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      {getTypeIcon(territory.type)}
                      {getTypeLabel(territory.type)}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(territory.status)}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(territory.status)}`}></span>
                    {getStatusLabel(territory.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Coordenadas */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-purple-600" />
                  Localização Precisa
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                      <p className="text-sm font-mono font-medium text-gray-800 dark:text-white">{territory.latitude.toFixed(6)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatCoordinates(territory.latitude, territory.longitude)}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(territory.latitude.toString())}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                      <p className="text-sm font-mono font-medium text-gray-800 dark:text-white">{territory.longitude.toFixed(6)}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(territory.longitude.toString())}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Coordenadas do mapa oficial
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-yellow-600">⚡</span>
                  Ações Rápidas
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => navigate(`/territory/${territory.id}/worker`)}
                  className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  <Navigation className="text-blue-600 w-5" />
                  Trabalhar Território
                </button>
                <button className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Edit className="text-blue-600 w-5" />
                  Editar Território
                </button>
                <button className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Users className="text-purple-600 w-5" />
                  Ver Designações
                </button>
                <button className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <History className="text-green-600 w-5" />
                  Histórico de Visitas
                </button>
                <button className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
                  <Trash2 className="text-red-600 w-5" />
                  Excluir Território
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritoryDetail;