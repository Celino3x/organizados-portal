import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Upload, Navigation, ExternalLink } from 'lucide-react';
import GoogleMyMap from '../components/maps/GoogleMyMap';

const TerritoryMap: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // ID do mapa do Google My Maps
  const MAP_ID = '11NYBu3CzYnHPvVLcg8sU7xmjK4V5y-A';
  const MAP_URL = `https://www.google.com/maps/d/u/0/viewer?mid=${MAP_ID}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🗺️ Mapa de Territórios</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Visualize todos os territórios da congregação no Google My Maps
            <a 
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
            >
              Abrir no Google Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/territories')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all text-sm font-medium"
          >
            Lista de Territórios
          </button>
        </div>
      </div>

      {/* Dicas de uso */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium">Como usar o mapa:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li>Clique nos marcadores para ver informações do território</li>
              <li>Use os botões de zoom (+ e -) para explorar a área</li>
              <li>Clique em "Abrir no Google Maps" para ver em tela cheia</li>
              <li>As cores dos marcadores indicam o status do território</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Google My Maps */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <GoogleMyMap
          mapId={MAP_ID}
          title="Mapa de Territórios - Congregação Vilar Guanabara"
          height="600px"
        />
        
        {/* Legenda */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-300">Legenda:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Disponível</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Designado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Em Andamento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Concluído</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              <span className="text-gray-600 dark:text-gray-400">Sua localização</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de ação rápida */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => window.open(MAP_URL, '_blank')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Mapa Completo
        </button>
        <button
          onClick={() => navigate('/territories')}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm font-medium"
        >
          <MapPin className="w-4 h-4" />
          Ver Lista de Territórios
        </button>
      </div>
    </div>
  );
};

export default TerritoryMap;