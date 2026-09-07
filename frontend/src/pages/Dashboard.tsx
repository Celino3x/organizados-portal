import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  MapPin,
  CheckCircle,
  ClipboardList,
  RefreshCw,
  FileCheck,
  Bell,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  Award,
  Info  // ← ADICIONADO
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
        <div className="text-[#64748b] dark:text-gray-400 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando estatísticas...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header mb-8 text-center border-b-2 border-[#e6ecf5] dark:border-[#334155] pb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MapPin className="w-12 h-12 text-[#1a3c6e] dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
          Portal Organizados
        </h1>
        <p className="text-[#64748b] dark:text-gray-400 text-base mt-1">
          Sistema de Gestão para Congregações
        </p>
        <div className="version inline-block mt-3 px-4 py-1 bg-[#e8eeff] dark:bg-[#1a3c6e]/30 text-[#1a3c6e] dark:text-blue-400 rounded-full text-xs font-semibold">
          v1.0.0 · Setembro 2026
        </div>
      </div>

      {/* Cards */}
      <div className="card-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="card-title">
                <Icon className={`w-5 h-5 ${card.color}`} />
                {card.title}
              </div>
              <div className="card-desc mt-2">
                <span className={`badge ${card.badge} text-base font-bold px-4 py-1.5`}>
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boas-vindas - USANDO AlertCircle EM VEZ DE Info */}
      <div className="alert alert-info flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Bem-vindo(a), {user?.name}!</strong>
          <br />
          O Portal Organizados está pronto para uso. Gerencie territórios, designações e publicadores da sua congregação.
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white border-b-2 border-[#e6ecf5] dark:border-[#334155] pb-2 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Atividades Recentes
        </h2>
        <div className="card">
          <div className="card-desc text-center py-8 text-[#64748b] dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            Nenhuma atividade recente
            <br />
            <span className="text-sm">Comece gerenciando seus territórios!</span>
          </div>
        </div>
      </div>

      {/* Dicas Rápidas */}
      <div className="mt-6 feature-grid">
        <div className="feature-item">
          <MapPin className="w-5 h-5 text-[#1a3c6e]" />
          <span>64 territórios disponíveis</span>
        </div>
        <div className="feature-item">
          <ClipboardList className="w-5 h-5 text-[#1a3c6e]" />
          <span>Designações de territórios</span>
        </div>
        <div className="feature-item">
          <Users className="w-5 h-5 text-[#1a3c6e]" />
          <span>Gerenciar publicadores</span>
        </div>
        <div className="feature-item">
          <TrendingUp className="w-5 h-5 text-[#1a3c6e]" />
          <span>Relatórios da congregação</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;