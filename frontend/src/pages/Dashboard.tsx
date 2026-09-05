import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, MapPin, Calendar, BookOpen, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface Stats {
  totalMembers: number;
  totalTerritories: number;
  totalDesignations: number;
  totalPublications: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalTerritories: 0,
    totalDesignations: 0,
    totalPublications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats({
        totalMembers: 284,
        totalTerritories: 156,
        totalDesignations: 42,
        totalPublications: 128
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Membros', value: stats.totalMembers, color: 'blue', change: '+12%' },
    { icon: MapPin, label: 'Territórios', value: stats.totalTerritories, color: 'green', change: '+8%' },
    { icon: Calendar, label: 'Designações', value: stats.totalDesignations, color: 'purple', change: '+5%' },
    { icon: BookOpen, label: 'Publicações', value: stats.totalPublications, color: 'orange', change: '+3%' },
  ];

  const recentActivities = [
    { user: 'João Silva', action: 'completou o território #42', time: '2 horas atrás' },
    { user: 'Maria Santos', action: 'criou uma nova designação', time: '5 horas atrás' },
    { user: 'Pedro Oliveira', action: 'atualizou o relatório S-21', time: '1 dia atrás' },
    { user: 'Ana Costa', action: 'iniciou um novo estudo bíblico', time: '2 dias atrás' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Dashboard</h1>
          <p className="text-[rgb(var(--foreground))] opacity-70 text-sm">Bem-vindo de volta, {user?.name}!</p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2 bg-[rgb(var(--card))] px-4 py-2 rounded-xl shadow-sm border border-[rgb(var(--border))]">
          <span className="text-sm text-[rgb(var(--foreground))] opacity-70">📅</span>
          <span className="text-sm font-medium text-[rgb(var(--foreground))]">{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-[rgb(var(--card))] rounded-2xl p-6 shadow-sm border border-[rgb(var(--border))] hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--foreground))] opacity-70 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">{stat.value}</p>
                <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Atividades Recentes */}
      <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Atividades Recentes</h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Ver todos</button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 pb-4 border-b border-[rgb(var(--border))] last:border-0 last:pb-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-[rgb(var(--foreground))]">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-[rgb(var(--foreground))] opacity-60">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;