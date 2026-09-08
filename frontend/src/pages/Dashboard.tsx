import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  MapPin,
  CheckCircle,
  ClipboardList,
  RefreshCw,
  FileCheck,
  Info,
  Activity,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';

interface Stats {
  totalMembers: number;
  totalTerritories: number;
  availableTerritories: number;
  assignedTerritories: number;
  inProgressTerritories: number;
  completedTerritories: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMembers: 1,
    totalTerritories: 64,
    availableTerritories: 64,
    assignedTerritories: 0,
    inProgressTerritories: 0,
    completedTerritories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const cards = [
    { 
      title: 'Membros', 
      value: stats.totalMembers, 
      icon: Users, 
      badge: 'badge-blue',
      color: 'text-blue-600'
    },
    { 
      title: 'Territórios', 
      value: stats.totalTerritories, 
      icon: MapPin, 
      badge: 'badge-green',
      color: 'text-green-600'
    },
    { 
      title: 'Disponíveis', 
      value: stats.availableTerritories, 
      icon: CheckCircle, 
      badge: 'badge-green',
      color: 'text-green-600'
    },
    { 
      title: 'Designados', 
      value: stats.assignedTerritories, 
      icon: ClipboardList, 
      badge: 'badge-yellow',
      color: 'text-yellow-600'
    },
    { 
      title: 'Em Andamento', 
      value: stats.inProgressTerritories, 
      icon: RefreshCw, 
      badge: 'badge-blue',
      color: 'text-blue-600'
    },
    { 
      title: 'Concluídos', 
      value: stats.completedTerritories, 
      icon: FileCheck, 
      badge: 'badge-purple',
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)] flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando estatísticas...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header mb-6 text-center border-b-2 border-[var(--border-color)] pb-4 md:pb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MapPin className="w-8 h-8 md:w-12 md:h-12 text-[#1a3c6e] dark:text-blue-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Portal Organizados
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] mt-1">
          Sistema de Gestão para Congregações
        </p>
        <div className="version inline-block mt-2 md:mt-3 px-3 py-1 md:px-4 md:py-1 bg-[var(--badge-bg)] text-[var(--badge-text)] rounded-full text-xs font-semibold">
          v1.0.0 · Setembro 2026
        </div>
      </div>

      {/* Cards - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card p-4 md:p-6">
              <div className="card-title text-sm md:text-base">
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
                {card.title}
              </div>
              <div className="card-desc mt-2">
                <span className={`badge ${card.badge} text-base md:text-lg font-bold px-3 py-1 md:px-4 md:py-1.5`}>
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boas-vindas */}
      <div className="alert alert-info flex items-start gap-3 mt-6 p-3 md:p-4">
        <Info className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm md:text-base">
          <strong>Bem-vindo(a), {user?.name}!</strong>
          <br />
          <span className="text-xs md:text-sm">O Portal Organizados está pronto para uso. Gerencie territórios, designações e publicadores da sua congregação.</span>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 md:w-6 md:h-6" />
          Atividades Recentes
        </h2>
        <div className="card p-4 md:p-6">
          <div className="card-desc text-center py-6 md:py-8 text-[var(--text-muted)]">
            <Clock className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm md:text-base">Nenhuma atividade recente</p>
            <span className="text-xs md:text-sm">Comece gerenciando seus territórios!</span>
          </div>
        </div>
      </div>

      {/* Dicas Rápidas - Responsivo */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="feature-item p-2 md:p-3 text-xs md:text-sm">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#1a3c6e] flex-shrink-0" />
          <span className="truncate">64 territórios</span>
        </div>
        <div className="feature-item p-2 md:p-3 text-xs md:text-sm">
          <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-[#1a3c6e] flex-shrink-0" />
          <span className="truncate">Designações</span>
        </div>
        <div className="feature-item p-2 md:p-3 text-xs md:text-sm">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-[#1a3c6e] flex-shrink-0" />
          <span className="truncate">Publicadores</span>
        </div>
        <div className="feature-item p-2 md:p-3 text-xs md:text-sm">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#1a3c6e] flex-shrink-0" />
          <span className="truncate">Relatórios</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;