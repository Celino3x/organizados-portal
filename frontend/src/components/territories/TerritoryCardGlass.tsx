import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  MapPin, Users, Calendar, Share2, Navigation, 
  Download, Eye, Copy, Check, Info, 
  Compass, Ruler, Globe, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight
} from 'lucide-react';
import { Territory } from '../../types';

interface TerritoryCardGlassProps {
  territory: Territory;
  congregationName?: string;
  onShare?: (territory: Territory) => void;
  onNavigate?: (territory: Territory) => void;
  onDownload?: (territory: Territory) => void;
  latitude?: number;
  longitude?: number;
  isExact?: boolean;
}

const TerritoryCardGlass: React.FC<TerritoryCardGlassProps> = ({ 
  territory, 
  congregationName = 'Vilar Guanabara',
  onShare,
  onNavigate,
  onDownload,
  latitude,
  longitude,
  isExact = false
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  // Usar coordenadas passadas ou as do território
  const lat = latitude || territory.latitude;
  const lng = longitude || territory.longitude;

  const getGoogleMapsLink = () => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=17`;
  };

  const getMapUrl = () => {
    return `https://www.google.com/maps/d/u/0/viewer?mid=${territory.mapId || '11NYBu3CzYnHPvVLcg8sU7xmjK4V5y-A'}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden max-w-lg w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">#{territory.number}</span>
              <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                {territory.type || 'Território'}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1">{territory.name}</h2>
            <p className="text-sm opacity-80">{congregationName}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🗺️</span>
          </div>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-5 space-y-4">
        {/* Coordenadas exatas */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {isExact ? '✅ Coordenadas exatas do KML' : '📍 Coordenadas aproximadas'}
              </span>
            </div>
            <button
              onClick={() => handleCopy(`${lat}, ${lng}`, 'coordenadas')}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
            >
              {copied === 'coordenadas' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="mt-1 font-mono text-xs text-blue-600 dark:text-blue-400">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>

        {/* Informações */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Número</p>
            <p className="font-bold text-gray-900 dark:text-white">#{territory.number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Grupo</p>
            <p className="font-medium text-gray-900 dark:text-white">{territory.group}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Localidades</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{territory.address}</p>
          </div>
        </div>

        {/* QR Code e Link */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <div className="flex-shrink-0">
            <QRCodeCanvas
              value={getGoogleMapsLink()}
              size={65}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">📍 Escaneie para abrir no mapa</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-600 truncate flex-1">
                {getGoogleMapsLink()}
              </code>
              <button
                onClick={() => handleCopy(getGoogleMapsLink(), 'link')}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                title="Copiar link"
              >
                {copied === 'link' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={() => onShare?.(territory)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
          <button
            onClick={() => onNavigate?.(territory)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Navigation className="w-4 h-4" />
            Navegar
          </button>
          <button
            onClick={() => window.open(getMapUrl(), '_blank')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Globe className="w-4 h-4" />
            Ver Mapa
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-slate-700">
          <span>📍 {isExact ? 'Coordenadas exatas do KML' : 'Coordenadas aproximadas'}</span>
          <span className="mx-2">•</span>
          <span>📐 {territory.area?.km2 || 0} km²</span>
        </div>
      </div>
    </div>
  );
};

export default TerritoryCardGlass;