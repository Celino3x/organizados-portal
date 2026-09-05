import React, { useState } from 'react';
import { 
  Share2, MessageCircle, Mail, Copy, Check,
  Phone, Globe, MapPin, Navigation, User,
  Clock, AlertCircle, Send
} from 'lucide-react';

interface ShareTerritoryProps {
  territory: {
    id: string;
    number: number;
    name: string;
    group: string;
    type: string;
    latitude: number;
    longitude: number;
  };
  publisher?: string;
  onClose?: () => void;
}

const ShareTerritory: React.FC<ShareTerritoryProps> = ({ 
  territory, 
  publisher = 'Designado',
  onClose 
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');

  const territoryLink = `${window.location.origin}/territory/${territory.id}/worker`;
  const googleMapsLink = `https://www.google.com/maps?q=${territory.latitude},${territory.longitude}&z=17`;

  const getMessage = () => {
    return (
      `📍 *TERRITÓRIO ${territory.number} - ${territory.name}*\n\n` +
      `📌 *Número:* ${territory.number}\n` +
      `📍 *Localidade:* ${territory.name}\n` +
      `👥 *Grupo:* ${territory.group}\n` +
      `📋 *Tipo:* ${territory.type}\n\n` +
      `🗺️ *Localização:* ${googleMapsLink}\n\n` +
      `🔗 *Link para trabalhar:*\n${territoryLink}\n\n` +
      `📱 *Abra no celular para:*\n` +
      `• Ver a localização exata no mapa\n` +
      `• Iniciar o território\n` +
      `• Concluir com relatório\n\n` +
      `⚠️ *Não deixe de comunicar e finalizar o território.*\n\n` +
      `📱 *Compartilhado via Portal Organizados*`
    );
  };

  const handleShare = () => {
    const message = encodeURIComponent(getMessage());
    
    switch (selectedMethod) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${message}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Território ${territory.number}&body=${message}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:?body=${message}`, '_blank');
        break;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(territoryLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 max-w-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          Compartilhar Território
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resumo do Território */}
      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              Território #{territory.number}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{territory.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>👥 {territory.group}</span>
          <span>📋 {territory.type}</span>
        </div>
      </div>

      {/* Método de Compartilhamento */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedMethod('whatsapp')}
          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            selectedMethod === 'whatsapp'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
        <button
          onClick={() => setSelectedMethod('email')}
          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            selectedMethod === 'email'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <Mail className="w-4 h-4" />
          E-mail
        </button>
        <button
          onClick={() => setSelectedMethod('sms')}
          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            selectedMethod === 'sms'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <Phone className="w-4 h-4" />
          SMS
        </button>
      </div>

      {/* Preview da Mensagem */}
      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 mb-4 max-h-40 overflow-y-auto">
        <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {getMessage().slice(0, 200)}...
        </p>
      </div>

      {/* Botão de Envio */}
      <button
        onClick={handleShare}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        Enviar via {selectedMethod === 'whatsapp' ? 'WhatsApp' : selectedMethod === 'email' ? 'E-mail' : 'SMS'}
      </button>

      {/* Link para Copiar */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">🔗 Link do território:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1.5 rounded-lg truncate">
            {territoryLink}
          </code>
          <button
            onClick={handleCopyLink}
            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Aviso */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            ⚠️ Lembre-se: o dirigente deve comunicar e finalizar o território após o trabalho.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareTerritory;