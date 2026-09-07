import React, { useState } from 'react';
import {
  BarChart3,
  BarChart2,
  LineChart,
  PieChart,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  ClipboardList,
  Award,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';

interface Report {
  id: string;
  month: string;
  totalPublishers: number;
  activePublishers: number;
  totalTerritories: number;
  completedTerritories: number;
  designations: number;
  hours: number;
  visits: number;
  studies: number;
}

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Dados mockados
  const reports: Report[] = [
    {
      id: '1',
      month: '2026-09',
      totalPublishers: 45,
      activePublishers: 38,
      totalTerritories: 64,
      completedTerritories: 12,
      designations: 8,
      hours: 320,
      visits: 156,
      studies: 23
    },
    {
      id: '2',
      month: '2026-08',
      totalPublishers: 44,
      activePublishers: 35,
      totalTerritories: 64,
      completedTerritories: 10,
      designations: 6,
      hours: 280,
      visits: 134,
      studies: 18
    }
  ];

  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const years = ['2025', '2026'];

  const currentReport = reports.find(r => r.month === selectedMonth) || reports[0];

  const statsCards = [
    {
      title: 'Publicadores Ativos',
      value: currentReport?.activePublishers || 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      badge: 'badge-blue'
    },
    {
      title: 'Territórios Concluídos',
      value: currentReport?.completedTerritories || 0,
      icon: MapPin,
      color: 'text-green-600 dark:text-green-400',
      badge: 'badge-green'
    },
    {
      title: 'Designações',
      value: currentReport?.designations || 0,
      icon: ClipboardList,
      color: 'text-purple-600 dark:text-purple-400',
      badge: 'badge-purple'
    },
    {
      title: 'Horas no Campo',
      value: currentReport?.hours || 0,
      icon: TrendingUp,
      color: 'text-yellow-600 dark:text-yellow-400',
      badge: 'badge-yellow'
    }
  ];

  return (
    <div>
      <div className="header mb-8 text-center border-b-2 border-[var(--border-color)] pb-6">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center justify-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#1a3c6e] dark:text-blue-400" />
          Relatórios
        </h1>
        <p className="text-[var(--text-muted)] text-base mt-1">
          Visualize relatórios da congregação
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            {months.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] dark:focus:ring-blue-400 transition appearance-none"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="px-4 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-hover)] transition-all duration-200 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="card-grid">
        {statsCards.map((card, index) => {
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

      {/* Resumo */}
      <div className="mt-6 card">
        <div className="card-title">
          <FileText className="w-5 h-5 text-[var(--text-muted)]" />
          Resumo do Mês
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm">
              <span className="font-medium">{currentReport?.totalPublishers || 0}</span>
              <span className="text-[var(--text-muted)]"> total de publicadores</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm">
              <span className="font-medium">{currentReport?.completedTerritories || 0}</span>
              <span className="text-[var(--text-muted)]"> territórios concluídos</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm">
              <span className="font-medium">{currentReport?.designations || 0}</span>
              <span className="text-[var(--text-muted)]"> designações</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm">
              <span className="font-medium">{currentReport?.visits || 0}</span>
              <span className="text-[var(--text-muted)]"> visitas</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm">
              <span className="font-medium">{currentReport?.studies || 0}</span>
              <span className="text-[var(--text-muted)]"> estudos bíblicos</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm">
              <span className="font-medium">{currentReport?.hours || 0}</span>
              <span className="text-[var(--text-muted)]"> horas</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Relatórios Anteriores */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Histórico de Relatórios
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Publicadores</th>
                <th>Territórios</th>
                <th>Designações</th>
                <th>Horas</th>
                <th>Visitas</th>
                <th>Estudos</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-[var(--bg-hover)] transition">
                  <td className="font-medium">
                    {new Date(report.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </td>
                  <td>{report.totalPublishers}</td>
                  <td>{report.completedTerritories}</td>
                  <td>{report.designations}</td>
                  <td>{report.hours}</td>
                  <td>{report.visits}</td>
                  <td>{report.studies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;