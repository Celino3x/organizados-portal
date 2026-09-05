import React, { useState } from 'react';
import { AlertCircle, Calendar, X, Check } from 'lucide-react';

interface DoNotVisitBadgeProps {
  territoryId: string;
  isAdmin?: boolean;
  onUpdate?: (data: { reason: string; date: string }) => void;
}

const DoNotVisitBadge: React.FC<DoNotVisitBadgeProps> = ({ 
  territoryId, 
  isAdmin = false,
  onUpdate 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(false);

  const handleSave = () => {
    if (reason.trim()) {
      setIsActive(true);
      onUpdate?.({ reason, date });
      setShowModal(false);
    }
  };

  const handleRemove = () => {
    setIsActive(false);
    setReason('');
  };

  return (
    <>
      {isActive ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-400">Não visitar</p>
              <p className="text-xs text-red-600 dark:text-red-300">{reason}</p>
              <p className="text-xs text-red-500 dark:text-red-400/70 mt-0.5">
                Desde {new Date(date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={handleRemove}
              className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2 border-2 border-dashed border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Marcar como "Não visitar"
          </button>
        )
      )}

      {/* Modal para definir "Não visitar" */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Motivo para não visitar
            </h3>
            <p className="text-sm text-[rgb(var(--foreground))] opacity-70 mt-2">
              Informe o motivo para que outros publicadores saibam que este território não deve ser visitado.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Motivo
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                  placeholder="Ex: Cão bravo, construção, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--foreground))] rounded-xl hover:bg-[rgb(var(--background))] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoNotVisitBadge;