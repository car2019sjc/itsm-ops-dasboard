import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { X, AlertTriangle, ExternalLink, PauseCircle, Timer } from 'lucide-react';
import { Incident } from '../types/incident';
import { parseISO, isWithinInterval, format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IncidentDetails } from './IncidentDetails';
import { normalizePriority, getIncidentState } from '../utils/incidentUtils';

interface SLAAnalysisProps {
  incidents: Incident[];
  onClose?: () => void;
  startDate?: string;
  endDate?: string;
}

interface IncidentModalProps {
  incidents: Incident[];
  priority: string;
  compliant: boolean;
  onClose: () => void;
}

const CHART_COLORS = {
  P1: '#EF4444',
  P2: '#3B82F6',
  P3: '#F59E0B',
  P4: '#10B981',
  'Não definido': '#6B7280'
};

const SLA_THRESHOLDS = {
  P1: 1,   // 1 hour
  P2: 4,   // 4 hours
  P3: 36,  // 36 hours
  P4: 72   // 72 hours
};

function IncidentModal({ incidents, priority, compliant, onClose }: IncidentModalProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getResponseTime = (incident: Incident): string => {
    try {
      const opened = parseISO(incident.Opened);
      const lastUpdate = incident.Updated ? parseISO(incident.Updated) : new Date();
      const priority = normalizePriority(incident.Priority);
      const threshold = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || 36;
      const totalHours = differenceInHours(lastUpdate, opened);
      
      if (totalHours <= threshold) {
        return 'Dentro do SLA';
      }

      const hoursOverSLA = totalHours - threshold;
      const days = Math.floor(hoursOverSLA / 24);
      const remainingHours = hoursOverSLA % 24;

      if (days > 0) {
        return `${days} ${days === 1 ? 'dia' : 'dias'}${remainingHours > 0 ? ` e ${remainingHours} ${remainingHours === 1 ? 'hora' : 'horas'}` : ''} fora do SLA`;
      }
      
      return `${hoursOverSLA} ${hoursOverSLA === 1 ? 'hora' : 'horas'} fora do SLA`;
    } catch (e) {
      return 'Tempo não calculado';
    }
  };

  const getStatusColor = (state: string) => {
    const normalizedState = getIncidentState(state);
    if (normalizedState === 'Fechado') return 'bg-green-500/20 text-green-400';
    if (normalizedState === 'Em Andamento') return 'bg-blue-500/20 text-blue-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-[#151B2B] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Chamados {priority} - {compliant ? 'Dentro do SLA' : 'Fora do SLA'}
            </h2>
            <p className="text-gray-400 mt-1">
              {incidents.length} chamados encontrados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1C2333] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-[#1C2333] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Número</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Data</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Solicitante</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Grupo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tempo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {incidents.map((incident) => (
                <tr 
                  key={incident.Number} 
                  className="hover:bg-[#1C2333] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">{incident.Number}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(incident.Opened)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{incident.ShortDescription}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{incident.Caller}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{incident.AssignmentGroup}</td>
                  <td className="px-4 py-3 text-sm text-red-400">{getResponseTime(incident)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.State)}`}>
                      {incident.State}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => setSelectedIncident(incident)}
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

export function SLAAnalysis({ incidents, onClose, startDate, endDate }: SLAAnalysisProps) {
  const [selectedIncidents, setSelectedIncidents] = useState<Incident[] | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCompliant, setSelectedCompliant] = useState<boolean>(true);
  const [showOnHoldOnly, setShowOnHoldOnly] = useState(false);

  const slaData = useMemo(() => {
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

    const data = filteredIncidents.reduce((acc, incident) => {
      const priority = normalizePriority(incident.Priority);
      const state = incident.State?.toLowerCase() || '';
      const isOnHold = state.includes('hold') || state.includes('pending') || state.includes('aguardando');
      
      if (showOnHoldOnly && !isOnHold) {
        return acc;
      }
      
      if (!acc[priority]) {
        acc[priority] = {
          priority,
          total: 0,
          withinResolutionSLA: 0,
          outsideResolutionSLA: 0,
          onHold: 0
        };
      }

      acc[priority].total++;

      if (isOnHold) {
        acc[priority].onHold++;
      }

      const threshold = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || 36;
      try {
        const opened = parseISO(incident.Opened);
        const lastUpdate = incident.Updated ? parseISO(incident.Updated) : new Date();
        const responseTime = differenceInHours(lastUpdate, opened);
        
        if (responseTime <= threshold) {
          acc[priority].withinResolutionSLA++;
        } else {
          acc[priority].outsideResolutionSLA++;
        }
      } catch (error) {
        acc[priority].outsideResolutionSLA++;
      }

      return acc;
    }, {} as Record<string, {
      priority: string;
      total: number;
      withinResolutionSLA: number;
      outsideResolutionSLA: number;
      onHold: number;
    }>);

    return Object.values(data).sort((a, b) => {
      const order = { P1: 0, P2: 1, P3: 2, P4: 3, 'Não definido': 4 };
      return (order[a.priority as keyof typeof order] || 0) - (order[b.priority as keyof typeof order] || 0);
    });
  }, [incidents, startDate, endDate, showOnHoldOnly]);

  const handleSLAClick = (priority: string, compliant: boolean) => {
    const threshold = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || 36;
    
    const filteredIncidents = incidents.filter(incident => {
      if (normalizePriority(incident.Priority) !== priority) return false;

      if (showOnHoldOnly) {
        const state = incident.State?.toLowerCase() || '';
        if (!state.includes('hold') && !state.includes('pending') && !state.includes('aguardando')) {
          return false;
        }
      }

      try {
        const opened = parseISO(incident.Opened);
        const lastUpdate = incident.Updated ? parseISO(incident.Updated) : new Date();
        const responseTime = differenceInHours(lastUpdate, opened);
        return compliant ? responseTime <= threshold : responseTime > threshold;
      } catch (error) {
        return !compliant;
      }
    });

    setSelectedIncidents(filteredIncidents);
    setSelectedPriority(priority);
    setSelectedCompliant(compliant);
  };

  return (
    <div className="bg-[#151B2B] p-6 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Análise de SLA</h2>
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

      {/* On Hold Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowOnHoldOnly(!showOnHoldOnly)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
            ${showOnHoldOnly 
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' 
              : 'bg-[#1C2333] text-gray-400 hover:text-white'}
          `}
        >
          <PauseCircle className="h-5 w-5" />
          <span>Somente On Hold</span>
        </button>
      </div>

      {/* SLA Compliance Chart */}
      <div className="bg-[#1C2333] p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Cumprimento de SLA por Prioridade</h3>
        <div className="space-y-4">
          {slaData.map(data => {
            const total = data.withinResolutionSLA + data.outsideResolutionSLA;
            const complianceRate = total > 0 ? (data.withinResolutionSLA / total) * 100 : 0;
            const targetRate = 95; // Global SLA target of 95%
            
            return (
              <div key={data.priority} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: CHART_COLORS[data.priority as keyof typeof CHART_COLORS] }}>
                      {data.priority}
                    </span>
                    {data.onHold > 0 && (
                      <span className="text-orange-400">
                        ({data.onHold} em espera)
                      </span>
                    )}
                  </div>
                  <span className={`font-medium ${
                    complianceRate >= targetRate ? 'text-green-400' :
                    complianceRate >= targetRate * 0.9 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {complianceRate.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar background */}
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative">
                  {/* Target line */}
                  <div 
                    className="absolute h-full w-0.5 bg-white/30 z-10"
                    style={{ left: `${targetRate}%` }}
                  />
                  
                  {/* Progress bar */}
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      complianceRate >= targetRate ? 'bg-green-500' :
                      complianceRate >= targetRate * 0.9 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${complianceRate}%` }}
                  />
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div>
                    <button
                      className={`hover:underline ${
                        data.withinResolutionSLA > 0 ? 'text-green-400' : 'text-gray-500'
                      }`}
                      onClick={() => data.withinResolutionSLA > 0 && handleSLAClick(data.priority, true)}
                      disabled={data.withinResolutionSLA === 0}
                    >
                      {data.withinResolutionSLA} no prazo
                    </button>
                    <span className="mx-2">•</span>
                    <button
                      className={`hover:underline ${
                        data.outsideResolutionSLA > 0 ? 'text-red-400' : 'text-gray-500'
                      }`}
                      onClick={() => data.outsideResolutionSLA > 0 && handleSLAClick(data.priority, false)}
                      disabled={data.outsideResolutionSLA === 0}
                    >
                      {data.outsideResolutionSLA} atrasados
                    </button>
                  </div>
                  <span>Meta: {targetRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA Summary */}
      <div className="bg-[#1C2333] p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Resumo de SLA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaData.map(data => {
            const total = data.withinResolutionSLA + data.outsideResolutionSLA;
            const complianceRate = total > 0 ? (data.withinResolutionSLA / total) * 100 : 0;
            const threshold = SLA_THRESHOLDS[data.priority as keyof typeof SLA_THRESHOLDS] || 36;
            
            return (
              <div 
                key={data.priority}
                className="bg-[#151B2B] p-4 rounded-lg"
                style={{ borderLeft: `4px solid ${CHART_COLORS[data.priority as keyof typeof CHART_COLORS]}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium" style={{ color: CHART_COLORS[data.priority as keyof typeof CHART_COLORS] }}>
                    {data.priority}
                  </h4>
                  <span className={`text-2xl font-bold ${
                    complianceRate >= 95 ? 'text-green-400' :
                    complianceRate >= 85 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {complianceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">
                    Meta de atendimento: {threshold} {threshold === 1 ? 'hora' : 'horas'}
                  </p>
                  <p className="text-gray-400">
                    Total de chamados: {data.total}
                  </p>
                  {data.onHold > 0 && (
                    <p className="text-orange-400">
                      {data.onHold} em espera
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-green-400">{data.withinResolutionSLA} no prazo</span>
                    <span className="text-red-400">{data.outsideResolutionSLA} atrasados</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedIncidents && (
        <IncidentModal
          incidents={selectedIncidents}
          priority={selectedPriority}
          compliant={selectedCompliant}
          onClose={() => {
            setSelectedIncidents(null);
            setSelectedPriority('');
            setSelectedCompliant(true);
          }}
        />
      )}
    </div>
  );
}