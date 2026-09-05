import React, { useState } from 'react';
import { 
  BarChart3, FileText, Users, Calendar, 
  TrendingUp, Download, Printer, Filter,
  ChevronRight, ChevronLeft, Search,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [selectedType, setSelectedType] = useState<'all' | 'service' | 'meeting' | 'territory'>('all');

  const stats = {
    totalPublishers: 45,
    activePublishers: 38,
    averageHours: 8.5,
    totalHours: 323,
    returnVisits: 52,
    bibleStudies: 12,
  };

  const reports = [
    { id: '1', publisher: 'Carlos Silva', group: 'Cosmos 1', hours: 12, returnVisits: 8, studies: 2, status: 'active' },
    { id: '2', publisher: 'Maria Santos', group: 'Cosmos 2', hours: 8, returnVisits: 5, studies: 1, status: 'pending' },
    { id: '3', publisher: 'João Oliveira', group: 'Cosmos 1', hours: 15, returnVisits: 10, studies: 3, status: 'active' },
    { id: '4', publisher: 'Ana Costa', group: 'Cosmos 2', hours: 0, returnVisits: 0, studies: 0, status: 'inactive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Relatórios</h1>
          <p className="text-[rgb(var(--foreground))] opacity-70 text-sm">
            Acompanhe as estatísticas da congregação
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm font-medium">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] rounded-xl hover:bg-[rgb(var(--background))] transition-all text-sm font-medium">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))]">
          <div className="flex items-center gap-2 text-[rgb(var(--foreground))] opacity-70">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">{stats.totalPublishers}</p>
          <p className="text-xs text-green-600 dark:text-green-400">{stats.activePublishers} ativos</p>
        </div>
        <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))]">
          <div className="flex items-center gap-2 text-[rgb(var(--foreground))] opacity-70">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Média</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">{stats.averageHours}h</p>
          <p className="text-xs text-[rgb(var(--foreground))] opacity-60">por publicador</p>
        </div>
        <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))]">
          <div className="flex items-center gap-2 text-[rgb(var(--foreground))] opacity-70">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Horas</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">{stats.totalHours}h</p>
          <p className="text-xs text-[rgb(var(--foreground))] opacity-60">total no mês</p>
        </div>
        <div className="bg-[rgb(var(--card))] rounded-2xl p-4 shadow-sm border border-[rgb(var(--border))]">
          <div className="flex items-center gap-2 text-[rgb(var(--foreground))] opacity-70">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Estudos</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">{stats.bibleStudies}</p>
          <p className="text-xs text-[rgb(var(--foreground))] opacity-60">{stats.returnVisits} revisitas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
        >
          <option value="2026-11">Novembro 2026</option>
          <option value="2026-10">Outubro 2026</option>
          <option value="2026-09">Setembro 2026</option>
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[rgb(var(--foreground))]"
        >
          <option value="all">Todos</option>
          <option value="service">Serviço de Campo</option>
          <option value="meeting">Reuniões</option>
          <option value="territory">Territórios</option>
        </select>
      </div>

      {/* Tabela de Relatórios */}
      <div className="bg-[rgb(var(--card))] rounded-2xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgb(var(--background))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Publicador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Revisitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Estudos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--foreground))] opacity-60 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-[rgb(var(--background))] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[rgb(var(--foreground))]">{report.publisher}</td>
                  <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">{report.group}</td>
                  <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">{report.hours}h</td>
                  <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">{report.returnVisits}</td>
                  <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))] opacity-80">{report.studies}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {report.status === 'active' && <CheckCircle className="w-3 h-3" />}
                      {report.status === 'pending' && <Clock className="w-3 h-3" />}
                      {report.status === 'inactive' && <AlertCircle className="w-3 h-3" />}
                      {report.status === 'active' ? 'Ativo' :
                       report.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[rgb(var(--foreground))] opacity-70">
          Mostrando 1-{reports.length} de {reports.length} relatórios
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--background))] transition-all disabled:opacity-50">
            <ChevronLeft className="w-4 h-4 text-[rgb(var(--foreground))] opacity-70" />
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
          <button className="p-2 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--background))] transition-all">
            <ChevronRight className="w-4 h-4 text-[rgb(var(--foreground))] opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;