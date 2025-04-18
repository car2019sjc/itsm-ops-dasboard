import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { X, AlertTriangle, ExternalLink, Filter, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Incident } from '../types/incident';
import { parseISO, isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IncidentDetails } from './IncidentDetails';
import { normalizePriority, getIncidentState } from '../utils/incidentUtils';
import { MonthlyIncidentsChart } from './MonthlyIncidentsChart';

interface UserAnalysisProps {
  incidents: Incident[];
  onClose?: () => void;
  startDate?: string;
  endDate?: string;
}

interface IncidentModalProps {
  incidents: Incident[];
  user: string;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

interface UserData {
  name: string;
  total: number;
  P1: number;
  P2: number;
  P3: number;
  P4: number;
  'Não definido': number;
  openIncidents: number;
  criticalPending: number;
  states: {
    Aberto: number;
    'Em Andamento': number;
    Fechado: number;
    [key: string]: number;
  };
  [key: string]: any;
}

const STATUS_OPTIONS = [
  { 
    value: '', 
    label: 'Todos os Estados',
    icon: Filter,
    color: 'text-gray-400'
  },
  { 
    value: 'Aberto', 
    label: 'Em Aberto',
    icon: AlertCircle,
    color: 'text-yellow-400'
  },
  { 
    value: 'Em Andamento', 
    label: 'Em Andamento',
    icon: Clock,
    color: 'text-blue-400'
  },
  { 
    value: 'Fechado', 
    label: 'Fechados',
    icon: CheckCircle2,
    color: 'text-green-400'
  }
];

const CHART_COLORS = {
  P1: '#EF4444',
  P2: '#3B82F6',
  P3: '#F59E0B',
  P4: '#10B981',
  'Não definido': '#6B7280'
};

function IncidentModal({ incidents, user, onClose, startDate, endDate }: IncidentModalProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [monthlyIncidents, setMonthlyIncidents] = useState<Incident[] | null>(null);

  const filteredIncidents = useMemo(() => {
    let filtered = monthlyIncidents || incidents;
    
    if (!selectedStatus) return filtered;
    return filtered.filter(incident => 
      getIncidentState(incident.State) === selectedStatus
    );
  }, [incidents, selectedStatus, monthlyIncidents]);

  const handleMonthSelect = (monthIncidents: Incident[]) => {
    setMonthlyIncidents(monthIncidents);
  };

  const clearMonthFilter = () => {
    setMonthlyIncidents(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getStatusColor = (state: string) => {
    const normalizedState = getIncidentState(state);
    if (normalizedState === 'Fechado') return 'bg-green-500/20 text-green-400';
    if (normalizedState === 'Em Andamento') return 'bg-blue-500/20 text-blue-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  const statusCounts = useMemo(() => {
    return {
      Aberto: incidents.filter(i => getIncidentState(i.State) === 'Aberto').length,
      'Em Andamento': incidents.filter(i => getIncidentState(i.State) === 'Em Andamento').length,
      Fechado: incidents.filter(i => getIncidentState(i.State) === 'Fechado').length
    };
  }, [incidents]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-[#151B2B] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Chamados de {user}
                {monthlyIncidents && (
                  <button
                    onClick={clearMonthFilter}
                    className="ml-2 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    (Limpar filtro mensal)
                  </button>
                )}
              </h2>
              <p className="text-gray-400 mt-1">
                {filteredIncidents.length} chamados encontrados
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1C2333] rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          <div className="flex gap-2 items-center">
            {STATUS_OPTIONS.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
                    ${option.value === selectedStatus 
                      ? `${option.color} bg-[#0B1120] border border-current` 
                      : 'text-gray-400 hover:text-white hover:bg-[#1C2333]'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
            <div className="ml-4 border-l border-gray-700 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Evolução Mensal</span>
                <MonthlyIncidentsChart
                  incidents={incidents}
                  startDate={startDate}
                  endDate={endDate}
                  onBarClick={handleMonthSelect}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-200px)]">
          <table className="w-full">
            <thead className="bg-[#1C2333] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Número</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Data</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Categoria</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Prioridade</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredIncidents.map((incident) => (
                <tr 
                  key={incident.Number} 
                  className="hover:bg-[#1C2333] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">{incident.Number}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(incident.Opened)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{incident.ShortDescription}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{incident.Category}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-sm" style={{ color: CHART_COLORS[normalizePriority(incident.Priority) as keyof typeof CHART_COLORS] }}>
                      {incident.Priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.State)}`}>
                      {incident.State}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(incident);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}

export function UserAnalysis({ incidents, onClose, startDate, endDate }: UserAnalysisProps) {
  const [selectedIncidents, setSelectedIncidents] = useState<Incident[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');

  const userData = useMemo(() => {
    const filteredIncidents = incidents.filter(incident => {
      if (!startDate || !endDate) return true;
      
      try {
        const incidentDate = parseISO(incident.Opened);
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        return isWithinInterval(incidentDate, { start, end });
      } catch (error) {
        return false;
      }
    });

    const data: Record<string, UserData> = {};

    filteredIncidents.forEach(incident => {
      const caller = incident.Caller?.trim() || 'Não identificado';
      const priority = normalizePriority(incident.Priority);
      const state = getIncidentState(incident.State);
      
      if (!data[caller]) {
        data[caller] = {
          name: caller,
          total: 0,
          P1: 0,
          P2: 0,
          P3: 0,
          P4: 0,
          'Não definido': 0,
          openIncidents: 0,
          criticalPending: 0,
          states: {
            Aberto: 0,
            'Em Andamento': 0,
            Fechado: 0
          }
        };
      }

      data[caller].total++;
      data[caller][priority]++;
      data[caller].states[state]++;

      if (state !== 'Fechado') {
        data[caller].openIncidents++;
        if (priority === 'P1' || priority === 'P2') {
          data[caller].criticalPending++;
        }
      }
    });

    const totalIncidents = Object.values(data).reduce((sum, user) => sum + user.total, 0);

    return Object.values(data)
      .map(user => ({
        ...user,
        percentage: (user.total / totalIncidents) * 100
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  }, [incidents, startDate, endDate]);

  const handleUserClick = (user: string) => {
    const userIncidents = incidents.filter(incident => {
      const caller = incident.Caller?.trim() || 'Não identificado';
      return caller === user;
    });
    setSelectedIncidents(userIncidents);
    setSelectedUser(user);
  };

  const chartData = useMemo(() => {
    return userData.slice(0, 5).map(user => ({
      name: user.name,
      P1: user.P1,
      P2: user.P2,
      P3: user.P3,
      P4: user.P4,
      'Não definido': user['Não definido'],
      total: user.total
    }));
  }, [userData]);

  return (
    <div className="bg-[#151B2B] p-6 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Principais Usuários</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1C2333] rounded-lg transition-colors"
            aria-label="Fechar análise"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Priority Distribution Chart */}
      <div className="bg-[#1C2333] p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Top 5 Usuários por Prioridade</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9CA3AF' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number, name: string) => [
                  `${value} chamados`,
                  name === 'Não definido' ? name : `Prioridade ${name}`
                ]}
              />
              <Legend />
              <Bar dataKey="P1" name="P1" fill={CHART_COLORS.P1} stackId="stack" />
              <Bar dataKey="P2" name="P2" fill={CHART_COLORS.P2} stackId="stack" />
              <Bar dataKey="P3" name="P3" fill={CHART_COLORS.P3} stackId="stack" />
              <Bar dataKey="P4" name="P4" fill={CHART_COLORS.P4} stackId="stack" />
              <Bar dataKey="Não definido" name="Não definido" fill={CHART_COLORS['Não definido']} stackId="stack" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1C2333] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#151B2B]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Usuário</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-400">P1</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-400">P2</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-400">P3</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-400">P4</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">Total</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {userData.map((user) => (
              <tr 
                key={user.name}
                className="hover:bg-[#151B2B] transition-colors cursor-pointer"
                onClick={() => handleUserClick(user.name)}
              >
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={user.criticalPending > 0 ? 'text-yellow-300' : 'text-white'}>
                      {user.name}
                    </span>
                    {user.criticalPending > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 rounded-full">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-red-500">
                          {user.criticalPending} críticos
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span style={{ color: CHART_COLORS.P1 }}>{user.P1}</span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span style={{ color: CHART_COLORS.P2 }}>{user.P2}</span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span style={{ color: CHART_COLORS.P3 }}>{user.P3}</span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span style={{ color: CHART_COLORS.P4 }}>{user.P4}</span>
                </td>
                <td className="px-6 py-4 text-sm text-right text-white">{user.total}</td>
                <td className="px-6 py-4 text-sm text-right text-white">{user.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIncidents && (
        <IncidentModal
          incidents={selectedIncidents}
          user={selectedUser}
          onClose={() => {
            setSelectedIncidents(null);
            setSelectedUser('');
          }}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}