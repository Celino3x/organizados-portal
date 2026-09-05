import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  MapPin, Users, Calendar, Share2, Download, 
  Eye, Copy, Check, Navigation, FileImage,
  Info, Link as LinkIcon, Smartphone, Image, X
} from 'lucide-react';
import { Territory } from '../../types';

interface TerritoryCardProps {
  territory: Territory;
  congregationName?: string;
  onShare?: (territory: Territory, type: 'image' | 'link' | 'text') => void;
  onNavigate?: (territory: Territory) => void;
  onDownload?: (territory: Territory) => void;
}

const TerritoryCard: React.FC<TerritoryCardProps> = ({ 
  territory, 
  congregationName = 'Vilar Guanabara',
  onShare,
  onNavigate,
  onDownload
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const getGoogleMapsLink = () => {
    return `https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17`;
  };

  const getTerritoryUrl = () => {
    return `${window.location.origin}/territories/${territory.id}`;
  };

  const getWhatsAppMessage = (type: 'image' | 'link' | 'text') => {
    const baseMsg = 
      `📍 *TERRITÓRIO ${territory.number} PARA TRABALHO*%0A%0A` +
      `📌 *Número:* ${territory.number}%0A` +
      `📍 *Localidade:* ${territory.name}%0A` +
      `👥 *Grupo:* ${territory.group || 'Não definido'}%0A` +
      `📋 *Endereço:* ${territory.address || 'Não informado'}%0A%0A` +
      `🗺️ *Mapa:* ${getGoogleMapsLink()}%0A%0A`;

    if (type === 'image') {
      return baseMsg + 
        `📎 *CARTÃO DO TERRITÓRIO:*%0A${territory.imageUrl || ''}%0A%0A` +
        `_Clique no link para visualizar/baixar o cartão_%0A%0A` +
        `📱 *Compartilhado via Portal Organizados*`;
    } else if (type === 'link') {
      return baseMsg + 
        `🔗 *LINK DO TERRITÓRIO:*%0A${getTerritoryUrl()}%0A%0A` +
        `_Clique para ver os detalhes e navegar_%0A%0A` +
        `📱 *Compartilhado via Portal Organizados*`;
    } else {
      return baseMsg + 
        `📱 *Compartilhado via Portal Organizados*`;
    }
  };

  const handleShare = (type: 'image' | 'link' | 'text') => {
    const message = getWhatsAppMessage(type);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowShareModal(false);
    onShare?.(territory, type);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden max-w-lg w-full">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                Cartão Digital
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(territory.status)}`}>
                {getStatusLabel(territory.status)}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1">Território #{territory.number}</h2>
            <p className="text-sm opacity-90">{territory.name}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">📍</span>
          </div>
        </div>
      </div>

      {/* Corpo do Cartão */}
      <div className="p-4 space-y-4">
        {/* Prévia da Imagem */}
        <div className="relative bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center">
          {territory.imageUrl ? (
            <img 
              src={territory.imageUrl} 
              alt={`Território ${territory.number}`}
              className="w-full h-auto max-h-[300px] object-cover"
            />
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500 p-8">
              <Image className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma imagem disponível</p>
              <p className="text-xs mt-1">Adicione uma imagem na pasta /territorio</p>
            </div>
          )}
          {territory.imageUrl && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => window.open(territory.imageUrl, '_blank')}
                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all"
                title="Ver imagem"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = territory.imageUrl || '';
                  link.download = `territorio_${territory.number}.jpg`;
                  link.target = '_blank';
                  link.click();
                  onDownload?.(territory);
                }}
                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all"
                title="Baixar imagem"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Localidade</p>
              <p className="font-medium text-gray-900 dark:text-white truncate">{territory.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Grupo</p>
              <p className="font-medium text-gray-900 dark:text-white">{territory.group || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Endereço</p>
              <p className="font-medium text-gray-900 dark:text-white text-xs truncate">{territory.address || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Visitas</p>
              <p className="font-medium text-gray-900 dark:text-white">{territory.visits}</p>
            </div>
          </div>
        </div>

        {/* QR Code e Links */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <div className="flex-shrink-0">
            <QRCodeCanvas
              value={getGoogleMapsLink()}
              size={70}
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
                onClick={() => handleCopy(getGoogleMapsLink(), 'mapa')}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                title="Copiar link"
              >
                {copied === 'mapa' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowShareModal(true)}
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
        </div>
      </div>

      {/* Modal de Compartilhamento WhatsApp */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Compartilhar no WhatsApp
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Escolha como deseja compartilhar o cartão do território:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleShare('image')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all text-left"
              >
                <FileImage className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Com imagem do cartão</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Envia a imagem do território</p>
                </div>
              </button>

              <button
                onClick={() => handleShare('link')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all text-left"
              >
                <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Com link do território</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Envia o link para o sistema</p>
                </div>
              </button>

              <button
                onClick={() => handleShare('text')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all text-left"
              >
                <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Apenas texto</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Envia apenas as informações</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryCard;