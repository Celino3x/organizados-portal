import React, { useState } from 'react';
import { Loader2, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface GoogleMyMapProps {
  mapId?: string;
  embedUrl?: string;
  title?: string;
  height?: string;
  className?: string;
}

const GoogleMyMap: React.FC<GoogleMyMapProps> = ({
  mapId = '11NYBu3CzYnHPvVLcg8sU7xmjK4V5y-A',
  embedUrl,
  title = 'Mapa de Territórios',
  height = '500px',
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // URL padrão do Google My Maps embed
  const defaultEmbedUrl = `https://www.google.com/maps/d/u/0/embed?mid=${mapId}`;
  const finalUrl = embedUrl || defaultEmbedUrl;

  // URL para abrir no Google Maps completo
  const fullMapUrl = `https://www.google.com/maps/d/u/0/viewer?mid=${mapId}`;

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700 ${className}`}>
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando mapa...</p>
          </div>
        </div>
      )}

      {/* Iframe do Google My Maps */}
      <iframe
        src={finalUrl}
        width="100%"
        height={fullscreen ? '100vh' : height}
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        onLoad={() => setLoading(false)}
        className={fullscreen ? 'fixed inset-0 z-50' : ''}
      />

      {/* Controles */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
          title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
        </button>
        <a
          href={fullMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
          title="Abrir no Google Maps"
        >
          <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </a>
      </div>

      {/* Badge de Informação */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg border border-gray-200 dark:border-slate-700">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>📍 Mapa oficial da congregação</span>
        </p>
      </div>

      {/* Overlay de instrução para mobile */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs whitespace-nowrap">
        👆 Toque e arraste para explorar
      </div>
    </div>
  );
};

export default GoogleMyMap;