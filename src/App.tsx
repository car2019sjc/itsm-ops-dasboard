import React, { useState, useMemo, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { DashboardHeader } from './components/DashboardHeader';
import { SearchBar } from './components/SearchBar';
import { StatsCard } from './components/StatsCard';
import { CategoryCard } from './components/CategoryCard';
import { PriorityAlert } from './components/PriorityAlert';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { SoftwareAnalysis } from './components/SoftwareAnalysis';
import { HardwareAnalysis } from './components/HardwareAnalysis';
import { GroupAnalysis } from './components/GroupAnalysis';
import { SLAAnalysis } from './components/SLAAnalysis';
import { UserAnalysis } from './components/UserAnalysis';
import { IncidentDetails } from './components/IncidentDetails';
import { GroupHistoryAnalysis } from './components/GroupHistoryAnalysis';
import { LocationAnalysis } from './components/LocationAnalysis';
import { AnalystAnalysis } from './components/AnalystAnalysis';
import { CriticalIncidentsModal } from './components/CriticalIncidentsModal';
import { PendingIncidentsModal } from './components/PendingIncidentsModal';
import { OnHoldIncidentsModal } from './components/OnHoldIncidentsModal';
import { OutOfRuleIncidentsModal } from './components/OutOfRuleIncidentsModal';
import { SupportQueuesAnalysis } from './components/SupportQueuesAnalysis';
import { CategoryHistoryAnalysis } from './components/CategoryHistoryAnalysis';
import { SLAHistoryAnalysis } from './components/SLAHistoryAnalysis';
import { AIAnalyst } from './components/AIAnalyst';
import { ShiftHistoryAnalysis } from './components/ShiftHistoryAnalysis';
import { LoginScreen } from './components/prod/LoginScreen';
import { RequestDashboard } from './components/RequestDashboard';
import { HistoricalDataAnalysis } from './components/HistoricalDataAnalysis';
import { FileUploadSelector } from './components/FileUploadSelector';
import { TopLocationCards } from './components/TopLocationCards';
import { CategoryHistoryTop5 } from './components/CategoryHistoryTop5';
import { LocationHistoryTop5 } from './components/LocationHistoryTop5';
import { MonthlyLocationSummary } from './components/MonthlyLocationSummary';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { Incident } from './types/incident';
import { Request } from './types/request';
import { getIncidentState, isHighPriority, isCancelled, normalizePriority } from './utils/incidentUtils';
import environment from './config/environment';
import { 
  BarChart3, 
  Monitor, 
  HardDrive, 
  Users, 
  Clock, 
  UserCircle,
  AlertOctagon,
  MapPin,
  History,
  AlertCircle,
  PauseCircle,
  Timer,
  Brain,
  UserCog,
  FileText,
  ArrowLeft,
  Calendar,
  PieChart
} from 'lucide-react';
import { format, isWithinInterval, parseISO, addDays, subDays, startOfDay, endOfDay, startOfYear, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Auth } from './components/Auth';

const SLA_THRESHOLDS = {
  P1: 1,   // 1 hour
  P2: 4,   // 4 hours
  P3: 36,  // 36 hours
  P4: 72   // 72 hours
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      // Limpar o estado de autenticação ao iniciar o app
      localStorage.removeItem('app_auth_state');
      return false;
    } catch {
      return false;
    }
  });

  const [showRequestDashboard, setShowRequestDashboard] = useState(false);
  const [showExecutiveDashboard, setShowExecutiveDashboard] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showPriorityAlert, setShowPriorityAlert] = useState(true);
  const [showHistorical, setShowHistorical] = useState(false);
  const [showCategoryAnalysis, setShowCategoryAnalysis] = useState(false);
  const [showSoftwareAnalysis, setShowSoftwareAnalysis] = useState(false);
  const [showHardwareAnalysis, setShowHardwareAnalysis] = useState(false);
  const [showGroupAnalysis, setShowGroupAnalysis] = useState(false);
  const [showSLAAnalysis, setShowSLAAnalysis] = useState(false);
  const [showUserAnalysis, setShowUserAnalysis] = useState(false);
  const [showLocationAnalysis, setShowLocationAnalysis] = useState(false);
  const [showGroupHistoryAnalysis, setShowGroupHistoryAnalysis] = useState(false);
  const [showAnalystAnalysis, setShowAnalystAnalysis] = useState(false);
  const [showCriticalIncidents, setShowCriticalIncidents] = useState(false);
  const [showPendingIncidents, setShowPendingIncidents] = useState(false);
  const [showOnHoldIncidents, setShowOnHoldIncidents] = useState(false);
  const [showOutOfRuleIncidents, setShowOutOfRuleIncidents] = useState(false);
  const [showCategoryHistoryAnalysis, setShowCategoryHistoryAnalysis] = useState(false);
  const [showSLAHistoryAnalysis, setShowSLAHistoryAnalysis] = useState(false);
  const [showAIAnalyst, setShowAIAnalyst] = useState(false);
  const [showShiftHistory, setShowShiftHistory] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showHistoricalData, setShowHistoricalData] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(true);
  const [showCategoryHistoryTop5, setShowCategoryHistoryTop5] = useState(false);
  const [showLocationHistoryTop5, setShowLocationHistoryTop5] = useState(false);
  const [showMonthlyLocationSummary, setShowMonthlyLocationSummary] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(incidents.map(i => {
      const category = i.Category?.trim() || 'Não categorizado';
      if (category.toLowerCase().includes('backup') || category.toLowerCase().includes('restore')) {
        return 'Backup/Restore';
      }
      if (category.toLowerCase().includes('security') || category.toLowerCase().includes('segurança')) {
        return 'IT Security';
      }
      if (category.toLowerCase().includes('monitor')) {
        return 'Monitoring';
      }
      if (category.toLowerCase().includes('rede') || category.toLowerCase().includes('network')) {
        return 'Network';
      }
      if (category.toLowerCase().includes('servidor') || category.toLowerCase().includes('server')) {
        return 'Server';
      }
      if (category.toLowerCase().includes('suporte') || category.toLowerCase().includes('support')) {
        return 'Service Support';
      }
      if (category.toLowerCase().includes('software') || category.toLowerCase().includes('programa')) {
        return 'Software';
      }
      if (category.toLowerCase().includes('hardware') || category.toLowerCase().includes('equipment')) {
        return 'Hardware';
      }
      if (category.toLowerCase().includes('cloud') || category.toLowerCase().includes('nuvem')) {
        return 'Cloud';
      }
      if (category.toLowerCase().includes('database') || category.toLowerCase().includes('banco de dados')) {
        return 'Database';
      }
      return category;
    }));
    return Array.from(uniqueCategories).sort();
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      if (isCancelled(incident.State)) {
        return false;
      }

      const query = searchQuery.toLowerCase().trim();
      
      if (!query) {
        const matchesCategory = selectedCategory
          ? incident.Category?.toLowerCase().includes(selectedCategory.toLowerCase())
          : true;

        const matchesStatus = selectedStatus
          ? getIncidentState(incident.State) === selectedStatus
          : true;

        try {
          const isInDateRange = isWithinInterval(parseISO(incident.Opened), {
            start: startOfDay(parseISO(startDate)),
            end: endOfDay(parseISO(endDate))
          });

          return matchesCategory && matchesStatus && isInDateRange;
        } catch (error) {
          return false;
        }
      }

      const searchFields = [
        incident.Number?.toLowerCase() || '',
        incident.ShortDescription?.toLowerCase() || '',
        incident.Caller?.toLowerCase() || '',
        incident.Category?.toLowerCase() || '',
        incident.AssignmentGroup?.toLowerCase() || '',
        incident.AssignedTo?.toLowerCase() || '',
        incident.Location?.toLowerCase() || ''
      ];

      const matchesSearch = searchFields.some(field => field.includes(query));

      const normalizedNumber = incident.Number?.toLowerCase().replace(/^0+/, '') || '';
      const normalizedQuery = query.replace(/^0+/, '');
      const matchesNumber = normalizedNumber === normalizedQuery || 
                          normalizedNumber.includes(normalizedQuery);

      const matchesCategory = selectedCategory
        ? incident.Category?.toLowerCase().includes(selectedCategory.toLowerCase())
        : true;

      const matchesStatus = selectedStatus
        ? getIncidentState(incident.State) === selectedStatus
        : true;

      try {
        const isInDateRange = isWithinInterval(parseISO(incident.Opened), {
          start: startOfDay(parseISO(startDate)),
          end: endOfDay(parseISO(endDate))
        });

        return (matchesSearch || matchesNumber) && matchesCategory && matchesStatus && isInDateRange;
      } catch (error) {
        return false;
      }
    });
  }, [incidents, searchQuery, selectedCategory, selectedStatus, startDate, endDate]);

  const criticalPendingIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const isPriority = isHighPriority(incident.Priority);
      const state = getIncidentState(incident.State);
      const cancelled = isCancelled(incident.State);
      return isPriority && state !== 'Fechado' && !cancelled;
    });
  }, [incidents]);

  const pendingIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const state = incident.State?.toLowerCase() || '';
      const normalizedState = getIncidentState(incident.State);
      const cancelled = isCancelled(incident.State);
      
      return normalizedState !== 'Fechado' && 
             !cancelled && 
             !state.includes('hold') && 
             !state.includes('pending') && 
             !state.includes('aguardando');
    });
  }, [incidents]);

  const onHoldIncidents = useMemo(() => {
    return filteredIncidents.filter(incident => {
      if (isCancelled(incident.State)) return false;
      const state = incident.State?.toLowerCase() || '';
      return state.includes('hold') || state.includes('pending') || state.includes('aguardando');
    });
  }, [filteredIncidents]);

  const outOfRuleIncidents = useMemo(() => {
    return filteredIncidents.filter(incident => {
      const state = incident.State?.toLowerCase() || '';
      
      // Exclude On Hold incidents
      if (state.includes('hold') || state.includes('pending') || state.includes('aguardando')) {
        return false;
      }

      // Check if incident is Open, In Progress, or Assigned
      const isValidState = state.includes('open') || 
                          state.includes('in progress') || 
                          state.includes('assigned') ||
                          state.includes('aberto') ||
                          state.includes('em andamento') ||
                          state.includes('atribuído');
      
      if (!isValidState) return false;
      
      try {
        // Check if it's been in this state for more than 48 hours
        const now = new Date();
        const lastUpdate = incident.Updated ? parseISO(incident.Updated) : now;
        const hoursElapsed = differenceInHours(now, lastUpdate);
        
        return hoursElapsed > 48;
      } catch (error) {
        return false;
      }
    });
  }, [filteredIncidents]);

  const stats = useMemo(() => {
    if (!filteredIncidents.length) return null;

    // Count total incidents and requests
    const totalIncidents = filteredIncidents.length;
    const totalRequests = requests.length;
    const totalItems = totalIncidents + totalRequests;

    const highPriorityIncidents = filteredIncidents.filter(i => 
      isHighPriority(i.Priority) && !isCancelled(i.State)
    ).length;

    const uniqueCategories = new Set(filteredIncidents.map(i => i.Category)).size;

    const criticalPendingCount = criticalPendingIncidents.length;
    const pendingCount = pendingIncidents.length;
    const onHoldCount = onHoldIncidents.length;
    const outOfRuleCount = outOfRuleIncidents.length;

    const highPriorityPercentage = ((highPriorityIncidents / totalIncidents) * 100).toFixed(2);
    const trend = parseFloat(highPriorityPercentage) > 0 ? `↑ ${highPriorityPercentage}%` : '0%';

    return {
      total: totalItems,
      highPriority: highPriorityIncidents,
      categories: uniqueCategories,
      criticalPending: criticalPendingCount,
      pending: pendingCount,
      onHold: onHoldCount,
      outOfRule: outOfRuleCount,
      trend
    };
  }, [filteredIncidents, requests, criticalPendingIncidents, pendingIncidents, onHoldIncidents, outOfRuleIncidents]);

  const handleIncidentsLoaded = (data: Incident[]) => {
    console.log("handleIncidentsLoaded called with", data.length, "incidents");
    setSearchQuery('');
    setStartDate(format(startOfYear(new Date()), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedCategory('');
    setSelectedStatus('');
    setShowPriorityAlert(true);
    setShowHistorical(false);
    setShowCategoryAnalysis(false);
    setShowSoftwareAnalysis(false);
    setShowHardwareAnalysis(false);
    setShowGroupAnalysis(false);
    setShowSLAAnalysis(false);
    setShowUserAnalysis(false);
    setShowLocationAnalysis(false);
    setShowGroupHistoryAnalysis(false);
    setShowAnalystAnalysis(false);
    setShowCategoryHistoryAnalysis(false);
    setShowSLAHistoryAnalysis(false);
    setShowAIAnalyst(false);
    setSelectedIncident(null);

    const processedData = data.map(incident => ({
      ...incident,
      Category: incident.Category || 'Não categorizado',
      Number: String(incident.Number),
      Opened: incident.Opened || new Date().toISOString(),
      State: incident.State || 'Aberto',
      Priority: incident.Priority || 'Não definido'
    }));

    console.log("Setting incidents:", processedData.length);
    setIncidents(processedData);
    
    // If we already have requests data, hide the file selector
    if (requests.length > 0) {
      setShowFileSelector(false);
    }
  };

  const handleRequestsLoaded = (data: Request[]) => {
    console.log("handleRequestsLoaded called with", data.length, "requests");
    setRequests(data);
    
    // If we already have incidents data, hide the file selector
    if (incidents.length > 0) {
      setShowFileSelector(false);
    }
  };

  const handleCloseIncidentDetails = () => {
    setSelectedIncident(null);
    setSearchQuery('');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('app_auth_state', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app_auth_state');
    setShowFileSelector(true);
    setIncidents([]);
    setRequests([]);
  };

  const handleLocationClick = (location: string) => {
    setShowLocationAnalysis(true);
    // You could also set a selected location in the LocationAnalysis component
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (showExecutiveDashboard) {
    return (
      <ExecutiveDashboard 
        incidents={incidents} 
        requests={requests} 
        onBack={() => setShowExecutiveDashboard(false)} 
      />
    );
  }

  if (showRequestDashboard) {
    return <RequestDashboard onBack={() => setShowRequestDashboard(false)} requests={requests} />;
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  console.log("Current incidents count:", incidents.length);
  console.log("Current requests count:", requests.length);
  console.log("Filtered incidents count:", filteredIncidents.length);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {!isAuthenticated ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <DashboardHeader
            title={environment.appTitle}
            onLogout={handleLogout}
            onShowRequestDashboard={() => setShowRequestDashboard(true)}
            onShowExecutiveDashboard={() => setShowExecutiveDashboard(true)}
          />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {showFileSelector ? (
              <div className="max-w-4xl mx-auto">
                <FileUploadSelector 
                  onSelectIncidents={handleIncidentsLoaded} 
                  onSelectRequests={handleRequestsLoaded} 
                />
              </div>
            ) : (
              <div className="space-y-8">
                {showPriorityAlert && criticalPendingIncidents.length > 0 && (
                  <PriorityAlert 
                    incidents={filteredIncidents}
                    onClose={() => setShowPriorityAlert(false)}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <StatsCard
                    title="Total de Chamados"
                    value={stats?.total || 0}
                    icon={BarChart3}
                    trend={stats?.trend}
                    className="bg-[#151B2B]"
                    onClick={() => setShowHistoricalData(!showHistoricalData)}
                    clickable={true}
                    subtitle="Clique para ver histórico"
                  />
                  <StatsCard
                    title="P1/P2 Pendentes"
                    value={stats?.criticalPending || 0}
                    icon={AlertOctagon}
                    trendColor="text-red-500"
                    className="bg-[#151B2B] border-2 border-red-500/50"
                    valueColor="text-red-500"
                    onClick={() => setShowCriticalIncidents(true)}
                    clickable={true}
                  />
                  <StatsCard
                    title="Chamados Pendentes"
                    value={stats?.pending || 0}
                    icon={AlertCircle}
                    className="bg-[#151B2B] border-2 border-yellow-500/50"
                    valueColor="text-yellow-500"
                    onClick={() => setShowPendingIncidents(true)}
                    clickable={true}
                  />
                  <StatsCard
                    title="Chamados On Hold"
                    value={stats?.onHold || 0}
                    icon={PauseCircle}
                    className="bg-[#151B2B] border-2 border-orange-500/50"
                    valueColor="text-orange-500"
                    onClick={() => setShowOnHoldIncidents(true)}
                    clickable={true}
                  />
                  <StatsCard
                    title="Fora de Regra"
                    value={stats?.outOfRule || 0}
                    icon={Timer}
                    className="bg-[#151B2B] border-2 border-red-500/50"
                    valueColor="text-red-500"
                    onClick={() => setShowOutOfRuleIncidents(true)}
                    clickable={true}
                    subtitle="Chamados abertos > 48h"
                    subtitleColor="text-red-400"
                  />
                </div>

                <div className="flex justify-between mb-4">
                  <button
                    onClick={() => setShowExecutiveDashboard(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <PieChart className="h-5 w-5" />
                    <span>Dashboard Executivo</span>
                  </button>
                  
                  <button
                    onClick={() => setShowRequestDashboard(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Ir para Dashboard de Requests</span>
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </button>
                </div>

                {/* Monthly Location Summary */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Sumarização Mensal por Localidade</h3>
                  <button
                    onClick={() => setShowMonthlyLocationSummary(!showMonthlyLocationSummary)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{showMonthlyLocationSummary ? 'Ocultar Detalhes' : 'Ver Detalhes'}</span>
                  </button>
                </div>

                {showMonthlyLocationSummary && (
                  <MonthlyLocationSummary
                    incidents={filteredIncidents}
                    onClose={() => setShowMonthlyLocationSummary(false)}
                  />
                )}

                <SupportQueuesAnalysis incidents={filteredIncidents} />

                {showHistoricalData && (
                  <HistoricalDataAnalysis
                    incidents={incidents}
                    requests={requests}
                    onClose={() => setShowHistoricalData(false)}
                  />
                )}

                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  incidents={incidents}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CategoryCard
                    title="Por Categoria"
                    description="Visualizar distribuição por categoria"
                    icon={BarChart3}
                    onClick={() => setShowCategoryAnalysis(!showCategoryAnalysis)}
                    active={showCategoryAnalysis}
                  />
                  <CategoryCard
                    title="Programas"
                    description="Análise de chamados de software"
                    icon={Monitor}
                    onClick={() => setShowSoftwareAnalysis(!showSoftwareAnalysis)}
                    active={showSoftwareAnalysis}
                  />
                  <CategoryCard
                    title="Hardware"
                    description="Análise de chamados de hardware"
                    icon={HardDrive}
                    onClick={() => setShowHardwareAnalysis(!showHardwareAnalysis)}
                    active={showHardwareAnalysis}
                  />
                  <CategoryCard
                    title="Por Grupo"
                    description="Distribuição por equipe"
                    icon={Users}
                    onClick={() => setShowGroupAnalysis(!showGroupAnalysis)}
                    active={showGroupAnalysis}
                  />
                  <CategoryCard
                    title="Acordo de Nível de Serviço (SLA)"
                    description="Análise de tempo de resposta"
                    icon={Clock}
                    onClick={() => setShowSLAAnalysis(!showSLAAnalysis)}
                    active={showSLAAnalysis}
                  />
                  <CategoryCard
                    title="Principais usuários"
                    description="Usuários mais frequentes"
                    icon={UserCircle}
                    onClick={() => setShowUserAnalysis(!showUserAnalysis)}
                    active={showUserAnalysis}
                  />
                  <CategoryCard
                    title="Por Localidade"
                    description="Análise por localização"
                    icon={MapPin}
                    onClick={() => setShowLocationAnalysis(!showLocationAnalysis)}
                    active={showLocationAnalysis}
                  />
                  <CategoryCard
                    title="Histórico por Grupo"
                    description="Análise histórica por equipe"
                    icon={History}
                    onClick={() => setShowGroupHistoryAnalysis(!showGroupHistoryAnalysis)}
                    active={showGroupHistoryAnalysis}
                  />
                  <CategoryCard
                    title="Histórico por Categoria"
                    description="Análise histórica por categoria"
                    icon={BarChart3}
                    onClick={() => setShowCategoryHistoryAnalysis(!showCategoryHistoryAnalysis)}
                    active={showCategoryHistoryAnalysis}
                  />
                  <CategoryCard
                    title="Histórico por SLA"
                    description="Análise histórica de SLA"
                    icon={Timer}
                    onClick={() => setShowSLAHistoryAnalysis(!showSLAHistoryAnalysis)}
                    active={showSLAHistoryAnalysis}
                  />
                  <CategoryCard
                    title="Histórico por Analista"
                    description="Análise histórica por analista"
                    icon={UserCog}
                    onClick={() => setShowAnalystAnalysis(!showAnalystAnalysis)}
                    active={showAnalystAnalysis}
                  />
                  <CategoryCard
                    title="Histórico por Turno"
                    description="Análise histórica por turno"
                    icon={Clock}
                    onClick={() => setShowShiftHistory(!showShiftHistory)}
                    active={showShiftHistory}
                  />
                  <CategoryCard
                    title="Top 5 Categorias"
                    description="Histórico das principais categorias"
                    icon={BarChart3}
                    onClick={() => setShowCategoryHistoryTop5(!showCategoryHistoryTop5)}
                    active={showCategoryHistoryTop5}
                  />
                  <CategoryCard
                    title="Top 5 Localidades"
                    description="Histórico das principais localidades"
                    icon={MapPin}
                    onClick={() => setShowLocationHistoryTop5(!showLocationHistoryTop5)}
                    active={showLocationHistoryTop5}
                  />
                  <CategoryCard
                    title="Análise Preditiva - IA"
                    description="Análise inteligente de incidentes"
                    icon={Brain}
                    onClick={() => setShowAIAnalyst(!showAIAnalyst)}
                    active={showAIAnalyst}
                  />
                  <CategoryCard
                    title="Dashboard Request"
                    description="Análise de Requests"
                    icon={FileText}
                    onClick={() => setShowRequestDashboard(true)}
                    active={false}
                  />
                </div>

                {showCategoryAnalysis && (
                  <CategoryAnalysis 
                    incidents={filteredIncidents}
                    onClose={() => setShowCategoryAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showSoftwareAnalysis && (
                  <SoftwareAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowSoftwareAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showHardwareAnalysis && (
                  <HardwareAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowHardwareAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showGroupAnalysis && (
                  <GroupAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowGroupAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showSLAAnalysis && (
                  <SLAAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowSLAAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showUserAnalysis && (
                  <UserAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowUserAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showLocationAnalysis && (
                  <LocationAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowLocationAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showGroupHistoryAnalysis && (
                  <GroupHistoryAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowGroupHistoryAnalysis(false)}
                  />
                )}

                {showCategoryHistoryAnalysis && (
                  <CategoryHistoryAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowCategoryHistoryAnalysis(false)}
                  />
                )}

                {showSLAHistoryAnalysis && (
                  <SLAHistoryAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowSLAHistoryAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showAnalystAnalysis && (
                  <AnalystAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowAnalystAnalysis(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showShiftHistory && (
                  <ShiftHistoryAnalysis
                    incidents={filteredIncidents}
                    onClose={() => setShowShiftHistory(false)}
                  />
                )}

                {showCategoryHistoryTop5 && (
                  <CategoryHistoryTop5
                    incidents={filteredIncidents}
                    onClose={() => setShowCategoryHistoryTop5(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showLocationHistoryTop5 && (
                  <LocationHistoryTop5
                    incidents={filteredIncidents}
                    onClose={() => setShowLocationHistoryTop5(false)}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}

                {showAIAnalyst && (
                  <AIAnalyst
                    incidents={filteredIncidents}
                    onClose={() => setShowAIAnalyst(false)}
                  />
                )}

                {selectedIncident && (
                  <IncidentDetails
                    incident={selectedIncident}
                    onClose={handleCloseIncidentDetails}
                  />
                )}

                {showCriticalIncidents && (
                  <CriticalIncidentsModal
                    incidents={criticalPendingIncidents}
                    onClose={() => setShowCriticalIncidents(false)}
                  />
                )}

                {showPendingIncidents && (
                  <PendingIncidentsModal
                    incidents={pendingIncidents}
                    onClose={() => setShowPendingIncidents(false)}
                  />
                )}

                {showOnHoldIncidents && (
                  <OnHoldIncidentsModal
                    incidents={onHoldIncidents}
                    onClose={() => setShowOnHoldIncidents(false)}
                  />
                )}

                {showOutOfRuleIncidents && (
                  <OutOfRuleIncidentsModal
                    incidents={outOfRuleIncidents}
                    onClose={() => setShowOutOfRuleIncidents(false)}
                  />
                )}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;