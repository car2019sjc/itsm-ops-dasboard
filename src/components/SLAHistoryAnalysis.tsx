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
  LabelList
} from 'recharts';
import { X, Timer, AlertTriangle, ChevronLeft, MousePointerClick } from 'lucide-react';
import { Incident } from '../types/incident';
import { parseISO, isWithinInterval, format, differenceInHours, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { normalizePriority } from '../utils/incidentUtils';

interface SLAHistoryAnalysisProps {
  incidents: Incident[];
  onClose?: () => void;
  startDate?: string;
  endDate?: string;
}

const SLA_THRESHOLDS = {
  P1: 1,   // 1 hour
  P2: 4,   // 4 hours
  P3: 36,  // 36 hours
  P4: 72   // 72 hours
};

const CHART_COLORS = {
  withinSLA: '#10B981', // Green
  outsideSLA: '#EF4444'  // Red
};

export function SLAHistoryAnalysis({ incidents, onClose, startDate, endDate }: SLAHistoryAnalysisProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const monthlyData = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const months = eachMonthOfInterval({ start, end });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthIncidents = incidents.filter(incident => {
        try {
          const incidentDate = parseISO(incident.Opened);
          return isWithinInterval(incidentDate, { start: monthStart, end: monthEnd });
        } catch (error) {
          return false;
        }
      });

      let withinSLA = 0;
      let outsideSLA = 0;
      let criticalOutsideSLA = 0;

      monthIncidents.forEach(incident => {
        const priority = normalizePriority(incident.Priority);
        const threshold = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || 36;
        
        try {
          const opened = parseISO(incident.Opened);
          const lastUpdate = incident.Updated ? parseISO(incident.Updated) : new Date();
          const responseTime = differenceInHours(lastUpdate, opened);

          if (responseTime <= threshold) {
            withinSLA++;
          } else {
            outsideSLA++;
            if (priority === 'P1' || priority === 'P2') {
              criticalOutsideSLA++;
            }
          }
        } catch (error) {
          outsideSLA++;
        }
      });

      const total = withinSLA + outsideSLA;
      const slaPercentage = total > 0 ? (withinSLA / total) * 100 : 0;

      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        monthStart,
        monthEnd,
        withinSLA,
        outsideSLA,
        criticalOutsideSLA,
        total,
        slaPercentage,
      };
    });
  }, [incidents, startDate, endDate]);

  const totalStats = useMemo(() => {
    const withinSLA = monthlyData.reduce((sum, month) => sum + month.withinSLA, 0);
    const outsideSLA = monthlyData.reduce((sum, month) => sum + month.outsideSLA, 0);
    const criticalOutsideSLA = monthlyData.reduce((sum, month) => sum + month.criticalOutsideSLA, 0);
    const total = withinSLA + outsideSLA;
    
    return {
      withinSLA,
      outsideSLA,
      criticalOutsideSLA,
      total,
      slaPercentage: total > 0 ? (withinSLA / total) * 100 : 0,
    };
  }, [monthlyData]);

  const categoryData = useMemo(() => {
    if (!selectedMonth) return [];

    const selectedMonthData = monthlyData.find(m => m.month === selectedMonth);
    if (!selectedMonthData) return [];

    const monthIncidents = incidents.filter(incident => {
      try {
        const incidentDate = parseISO(incident.Opened);
        return isWithinInterval(incidentDate, {
          start: selectedMonthData.monthStart,
          end: selectedMonthData.monthEnd
        });
      } catch (error) {
        return false;
      }
    });

    const categories = monthIncidents.reduce((acc, incident) => {
      const category = incident.Category || 'Não categorizado';
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          withinSLA: 0,
          outsideSLA: 0,
          total: 0
        };
      }

      const priority = normalizePriority(incident.Priority);
      const threshold = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || 36;
      
      try {
        const opened = parseISO(incident.Opened);
        const lastUpdate = incident.Updated ? parseISO(incident.Updated) : new Date();
        const responseTime = differenceInHours(lastUpdate, opened);

        if (responseTime <= threshold) {
          acc[category].withinSLA++;
        } else {
          acc[category].outsideSLA++;
        }
        acc[category].total++;
      } catch (error) {
        acc[category].outsideSLA++;
        acc[category].total++;
      }

      return acc;
    }, {} as Record<string, { 
      name: string; 
      withinSLA: number; 
      outsideSLA: number;
      total: number;
    }>);

    return Object.values(categories)
      .sort((a, b) => b.total - a.total);
  }, [incidents, selectedMonth, monthlyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const total = data.withinSLA + data.outsideSLA;

    return (
      <div className="bg-[#1F2937] p-4 rounded-lg border border-gray-700 shadow-xl">
        <p className="text-white font-medium mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-green-400">Dentro do SLA</span>
            <span className="text-white">{data.withinSLA} ({((data.withinSLA / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-red-400">Fora do SLA</span>
            <span className="text-white">{data.outsideSLA} ({((data.outsideSLA / total) * 100).toFixed(1)}%)</span>
          </div>
          {data.criticalOutsideSLA > 0 && (
            <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-gray-700">
              <span className="text-yellow-400">Críticos fora do SLA</span>
              <span className="text-white">{data.criticalOutsideSLA}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CategoryTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const total = data.withinSLA + data.outsideSLA;

    return (
      <div className="bg-[#1F2937] p-4 rounded-lg border border-gray-700 shadow-xl">
        <p className="text-white font-medium mb-2">{data.name}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-green-400">Dentro do SLA</span>
            <span className="text-white">{data.withinSLA} ({((data.withinSLA / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-red-400">Fora do SLA</span>
            <span className="text-white">{data.outsideSLA} ({((data.outsideSLA / total) * 100).toFixed(1)}%)</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-bold">{total}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value, height } = props;
    if (!value) return null;

    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#9CA3AF"
        textAnchor="middle"
        fontSize={12}
      >
        {value}
      </text>
    );
  };

  return (
    <div className="bg-[#151B2B] p-6 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Histórico por SLA</h2>
          <p className="text-gray-400 mt-1">
            {totalStats.total} chamados no período
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1C2333] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1C2333] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm text-gray-400">SLA Global</h3>
          </div>
          <p className={`text-2xl font-bold ${
            totalStats.slaPercentage >= 95 ? 'text-green-400' :
            totalStats.slaPercentage >= 85 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {totalStats.slaPercentage.toFixed(1)}%
          </p>
        </div>

        <div className="bg-[#1C2333] p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-2">Dentro do SLA</h3>
          <p className="text-2xl font-bold text-green-400">{totalStats.withinSLA}</p>
        </div>

        <div className="bg-[#1C2333] p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-2">Fora do SLA</h3>
          <p className="text-2xl font-bold text-red-400">{totalStats.outsideSLA}</p>
        </div>

        <div className="bg-[#1C2333] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <h3 className="text-sm text-gray-400">Críticos fora do SLA</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{totalStats.criticalOutsideSLA}</p>
        </div>
      </div>

      <div className="bg-[#1C2333] p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Distribuição por Mês</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
            <MousePointerClick className="h-4 w-4" />
            <span className="text-sm">Clique para ver os SLA's por Categoria</span>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              onClick={(data) => data && setSelectedMonth(data.activeLabel)}
              style={{ cursor: 'pointer' }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="outsideSLA" 
                name="Fora do SLA" 
                fill={CHART_COLORS.outsideSLA}
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  content={renderCustomBarLabel}
                  position="top"
                />
              </Bar>
              <Bar 
                dataKey="withinSLA" 
                name="Dentro do SLA" 
                fill={CHART_COLORS.withinSLA}
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  content={renderCustomBarLabel}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedMonth && (
        <div className="bg-[#1C2333] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedMonth(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar para visão mensal</span>
            </button>
            <h3 className="text-lg font-medium text-white">
              Análise por Categoria - {selectedMonth}
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#9CA3AF' }} 
                  width={90}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Legend />
                <Bar 
                  dataKey="outsideSLA" 
                  name="Fora do SLA" 
                  fill={CHART_COLORS.outsideSLA}
                  radius={[0, 4, 4, 0]}
                >
                  <LabelList 
                    content={renderCustomBarLabel}
                    position="right"
                  />
                </Bar>
                <Bar 
                  dataKey="withinSLA" 
                  name="Dentro do SLA" 
                  fill={CHART_COLORS.withinSLA}
                  radius={[0, 4, 4, 0]}
                >
                  <LabelList 
                    content={renderCustomBarLabel}
                    position="right"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}