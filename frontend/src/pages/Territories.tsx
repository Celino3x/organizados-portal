import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, 
  MapPin, Grid3x3, List,
  Maximize2, Minimize2, Compass, Plus as PlusIcon, Minus,
  Navigation, Share2, Info, Building, Home, Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllTerritories } from '../data/territories';
import { Territory } from '../types';

const Territories: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const data = getAllTerritories();
    setTerritories(data);
    setLoading(false);
  }, []);

  const filteredTerritories = territories.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.number.toString().includes(search) ||
                          t.group.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'assigned': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'residential': return 'Residencial';
      case 'commercial': return 'Comercial';
      case 'mixed': return 'Misto';
      case 'condominium': return 'Condomínio';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'condominium': return <Building className="w-4 h-4" />;
      case 'residential': return <Home className="w-4 h-4" />;
      case 'commercial': return <Store className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      'Cosmos 1': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Cosmos 2': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Cosmos 3': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Cosmos 4': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Icurana 1': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Icurana 2': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      'Vilar Guanabara 1': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Vilar Guanabara 2': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    };
    return colors[group] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  // Função para abrir o território no Google Maps
  const openInGoogleMaps = (territory: Territory) => {
    window.open(
      `https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17`,
      '_blank'
    );
  };

  // Função para compartilhar via WhatsApp
  const shareWhatsApp = (territory: Territory) => {
    const message = 
      `📍 *TERRITÓRIO ${territory.number} - ${territory.name}*\n\n` +
      `📌 *Número:* ${territory.number}\n` +
      `📍 *Localidade:* ${territory.name}\n` +
      `👥 *Grupo:* ${territory.group}\n` +
      `📋 *Tipo:* ${getTypeLabel(territory.type)}\n\n` +
      `🗺️ *Mapa:* https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17\n\n` +
      `📱 *Compartilhado via Portal Organizados*`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleViewDetail = (territory: Territory) => {
    navigate(`/territories/detail/${territory.id}`);
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
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
            Territórios
          </h1>
          <p className="text-[rgb(var(--foreground))] opacity-70 text-sm">
            Gerencie os territórios da congregação
            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              {filteredTerritories.length} encontrados
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2.5 transition-all ${viewMode === 'map' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-[rgb(var(--foreground))] opacity-50 hover:opacity-100'}`}
              title="Visualizar Mapa"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-[rgb(var(--foreground))] opacity-50 hover:opacity-100'}`}
              title="Visualizar Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Território
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--foreground))] opacity-40 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar território por número, nome ou grupo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--foreground))] placeholder:opacity-40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
        >
          <option value="all">Todos os status</option>
          <option value="available">Disponível</option>
          <option value="assigned">Designado</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluído</option>
        </select>
      </div>

      {/* Conteúdo Principal - Mapa */}
      {viewMode === 'map' ? (
        <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
          {/* Cabeçalho do Mapa */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-[rgb(var(--border))] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-[rgb(var(--foreground))]">Localização dos Territórios</h2>
                <p className="text-xs text-[rgb(var(--foreground))] opacity-60">
                  {filteredTerritories.length} territórios • Clique no marcador para detalhes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-3 py-1.5 bg-white/80 dark:bg-slate-700/80 rounded-lg text-sm text-[rgb(var(--foreground))] opacity-70 hover:opacity-100 transition-colors border border-[rgb(var(--border))] flex items-center gap-2"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Sair' : 'Tela cheia'}
              </button>
            </div>
          </div>

          {/* Mapa */}
          <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[500px]'} bg-gradient-to-b from-blue-50/30 to-gray-100/30 dark:from-blue-900/10 dark:to-gray-800/10 p-4`}>
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-[rgb(var(--border))]">
              {/* Iframe do Google Maps com todos os territórios */}
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${territories[0]?.latitude || -22.914794},${territories[0]?.longitude || -43.616536}&zoom=13&maptype=roadmap`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Territórios"
                className="rounded-xl"
              />
              
              {/* Overlay com informações dos territórios */}
              <div className="absolute inset-0 pointer-events-none">
                {filteredTerritories.slice(0, 8).map((territory, index) => {
                  // Posições simuladas para demonstração
                  const positions = [
                    { top: '25%', left: '15%' },
                    { top: '35%', left: '45%' },
                    { top: '55%', left: '30%' },
                    { top: '70%', left: '60%' },
                    { top: '85%', left: '15%' },
                    { top: '40%', left: '75%' },
                    { top: '20%', left: '85%' },
                    { top: '65%', left: '85%' },
                  ];
                  const pos = positions[index % positions.length];
                  return (
                    <div 
                      key={territory.id}
                      className="absolute cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ top: pos.top, left: pos.left }}
                      onClick={() => handleViewDetail(territory)}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold border-2 border-white dark:border-slate-800 ${
                          territory.status === 'available' ? 'bg-green-500' :
                          territory.status === 'assigned' ? 'bg-yellow-500' :
                          territory.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}>
                          {territory.number}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          #{territory.number} - {territory.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controles do Mapa */}
              <div className="absolute right-4 top-4 flex flex-col gap-1 z-10">
                <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                  <Minus className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                  <Compass className="w-4 h-4" />
                </button>
              </div>

              {/* Legenda do Mapa */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 shadow-lg border border-[rgb(var(--border))] text-xs space-y-1.5 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 bg-blue-600/20 rounded"></div>
                  <span className="text-[rgb(var(--foreground))] opacity-80">Territórios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gray-400 dark:bg-gray-500"></div>
                  <span className="text-[rgb(var(--foreground))] opacity-80">Ruas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-[rgb(var(--foreground))] opacity-80">Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-[rgb(var(--foreground))] opacity-80">Designado</span>
                </div>
              </div>
            </div>

            {/* Instrução Flutuante */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 animate-bounce z-10">
              <MapPin className="w-4 h-4" />
              Clique nos marcadores para ver detalhes
            </div>
          </div>

          {/* Informações Rápidas abaixo do mapa */}
          <div className="px-6 py-4 border-t border-[rgb(var(--border))] grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-[rgb(var(--foreground))] opacity-60">Total</p>
              <p className="text-sm font-medium text-[rgb(var(--foreground))]">{filteredTerritories.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[rgb(var(--foreground))] opacity-60">Disponíveis</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {filteredTerritories.filter(t => t.status === 'available').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[rgb(var(--foreground))] opacity-60">Designados</p>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {filteredTerritories.filter(t => t.status === 'assigned' || t.status === 'in_progress').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[rgb(var(--foreground))] opacity-60">Concluídos</p>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {filteredTerritories.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Modo Lista
        <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--background))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Grupo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Visitas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {filteredTerritories.map((territory) => (
                  <tr key={territory.id} className="hover:bg-[rgb(var(--background))] transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-[rgb(var(--foreground))]">#{territory.number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{territory.name}</p>
                        <p className="text-xs text-[rgb(var(--foreground))] opacity-60">{territory.address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getGroupColor(territory.group)}`}>
                        {territory.group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">
                      <span className="flex items-center gap-1">
                        {getTypeIcon(territory.type)}
                        {getTypeLabel(territory.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(territory.status)}`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(territory.status)}`}></span>
                        {getStatusLabel(territory.status)}
                      </span>
                      {territory.assignedToName && (
                        <p className="text-xs text-[rgb(var(--foreground))] opacity-60 mt-0.5">
                          👤 {territory.assignedToName}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">{territory.visits}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(territory)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareWhatsApp(territory)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                          title="Compartilhar WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openInGoogleMaps(territory)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          title="Abrir no Google Maps"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {viewMode === 'list' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[rgb(var(--foreground))] opacity-70">
            Mostrando 1-{filteredTerritories.length} de {filteredTerritories.length} territórios
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
      )}
    </div>
  );
};

export default Territories;