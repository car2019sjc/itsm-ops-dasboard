import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Calendar, Filter, X, AlertCircle, Clock, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Request, normalizeRequestPriority, normalizeRequestStatus, REQUEST_PRIORITIES, REQUEST_STATUSES } from '../types/request';
import { CalendarSelector } from './CalendarSelector';
import { RequestDetails } from './RequestDetails';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  requests: Request[];
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
}

const CHART_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
  NEW: '#3b82f6',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#6b7280'
} as const;

export function SearchBar({
  value,
  onChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedCategory,
  onCategoryChange,
  categories,
  requests,
  selectedStatus,
  onStatusChange
}: SearchBarProps) {
  const [searchResults, setSearchResults] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Log quando selectedRequest mudar
  useEffect(() => {
    if (selectedRequest) {
      console.log('Request selecionada:', selectedRequest);
    }
  }, [selectedRequest]);

  // Handle click outside search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search results when value changes
  useEffect(() => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const query = value.toLowerCase().trim();
    const results = requests.filter(request => {
      const searchFields = [
        request.Number?.toLowerCase() || '',
        request.ShortDescription?.toLowerCase() || '',
        request.RequestedForName?.toLowerCase() || '',
        request.RequestItem?.toLowerCase() || '',
        request.AssignmentGroup?.toLowerCase() || '',
        request.AssignedTo?.toLowerCase() || ''
      ];

      // Check if any field contains the search query
      const matchesSearch = searchFields.some(field => field.includes(query));

      // Special handling for request numbers
      const normalizedNumber = request.Number?.toLowerCase().replace(/^0+/, '') || '';
      const normalizedQuery = query.replace(/^0+/, '');
      const matchesNumber = normalizedNumber === normalizedQuery || 
                          normalizedNumber.includes(normalizedQuery);

      return matchesSearch || matchesNumber;
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results for better performance
  }, [value, requests]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const clearSearch = useCallback(() => {
    onChange('');
    setSearchResults([]);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  }, [clearSearch]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange) {
      onStatusChange(e.target.value);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const formatDateForDisplay = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getStatusColor = (state: string) => {
    const normalizedState = normalizeRequestStatus(state);
    switch (normalizedState) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="bg-[#151B2B] p-6 rounded-lg space-y-6">
      <h2 className="text-lg font-semibold mb-4">Buscar Solicitação</h2>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div ref={searchContainerRef} className="relative flex-1 search-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={value}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por número, descrição, solicitante..."
            className={`
              w-full pl-10 pr-10 py-2 bg-[#0B1120] border rounded-lg text-white 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
              transition-all duration-200
              ${searchFocused ? 'border-indigo-500' : 'border-gray-700'}
            `}
          />
          {value && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {searchFocused && value && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-[#1C2333] rounded-lg shadow-xl border border-gray-700 max-h-[400px] overflow-y-auto">
              {searchResults.map(request => (
                <button
                  key={request.Number}
                  onClick={() => {
                    console.log('Request completo:', JSON.stringify(request, null, 2));
                    setSelectedRequest(request);
                    setSearchFocused(false);
                  }}
                  className="w-full p-4 hover:bg-[#151B2B] transition-colors flex items-center justify-between gap-4 border-b border-gray-700 last:border-0"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{request.Number}</span>
                      <span className="text-sm" style={{ color: CHART_COLORS[normalizeRequestPriority(request.Priority) as keyof typeof CHART_COLORS] }}>
                        {REQUEST_PRIORITIES[normalizeRequestPriority(request.Priority)]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.State)}`}>
                        {REQUEST_STATUSES[normalizeRequestStatus(request.State)]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{request.ShortDescription}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{formatDate(request.Opened)}</span>
                      <span>•</span>
                      <span>{request.RequestedForName}</span>
                      {request.AssignmentGroup && (
                        <>
                          <span>•</span>
                          <span>{request.AssignmentGroup}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-indigo-400" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-5 w-5" />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full pl-10 pr-4 py-2 bg-[#0B1120] text-white border border-yellow-400/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {onStatusChange && (
          <div className="relative min-w-[200px]">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="w-full pl-10 pr-4 py-2 bg-[#0B1120] text-white border border-blue-400/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todos os Estados</option>
              <option value="NEW">Novo</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-3 py-2 bg-[#0B1120] border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <Calendar className="h-5 w-5 text-gray-400" />
            <span>Selecionar Período</span>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B1120] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(startDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B1120] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(endDate)}
              </p>
            </div>
          </div>
        </div>

        {showCalendar && (
          <CalendarSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </div>

      {/* Quick Date Filters */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            onStartDateChange(thirtyDaysAgo.toISOString().split('T')[0]);
            onEndDateChange(today.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 bg-[#0B1120] hover:bg-indigo-600/20 text-gray-400 hover:text-white rounded-full text-sm transition-colors"
        >
          Últimos 30 dias
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            onStartDateChange(sevenDaysAgo.toISOString().split('T')[0]);
            onEndDateChange(today.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 bg-[#0B1120] hover:bg-indigo-600/20 text-gray-400 hover:text-white rounded-full text-sm transition-colors"
        >
          Últimos 7 dias
        </button>
        <button
          onClick={() => {
            const today = new Date();
            onStartDateChange(today.toISOString().split('T')[0]);
            onEndDateChange(today.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 bg-[#0B1120] hover:bg-indigo-600/20 text-gray-400 hover:text-white rounded-full text-sm transition-colors"
        >
          Hoje
        </button>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[9999]">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              console.log('Clicou no backdrop');
              setSelectedRequest(null);
            }}
          />
          <div className="relative z-[10000]">
            <RequestDetails
              request={selectedRequest}
              onClose={() => {
                console.log('Fechando modal de detalhes');
                setSelectedRequest(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}