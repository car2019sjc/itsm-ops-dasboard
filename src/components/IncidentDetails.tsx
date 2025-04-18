import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Tag, 
  Users, 
  Clock, 
  MessageSquare, 
  ChevronDown,
  ChevronRight,
  X,
  Timer
} from 'lucide-react';
import { Incident } from '../types/incident';
import { format, parseISO, differenceInHours, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { normalizePriority } from '../utils/incidentUtils';
import { normalizeLocationName } from '../utils/locationUtils';

interface IncidentDetailsProps {
  incident: Incident;
  onClose: () => void;
}

const SLA_THRESHOLDS = {
  P1: 1,   // 1 hour
  P2: 4,   // 4 hours
  P3: 36,  // 36 hours
  P4: 72   // 72 hours
};

export function IncidentDetails({ incident, onClose }: IncidentDetailsProps) {
  const [showComments, setShowComments] = useState(true);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('incident-details-modal');
      if (modal && !modal.contains(event.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getSLABreachTime = () => {
    try {
      const priority = normalizePriority(incident.Priority);
      const threshold = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || 36;
      const opened = parseISO(incident.Opened);
      const lastUpdate = incident.Updated ? parseISO(incident.Updated) : opened;
      const totalHours = differenceInHours(lastUpdate, opened);
      
      if (totalHours <= threshold) {
        return null; // Within SLA
      }

      const hoursOverSLA = totalHours - threshold;
      const days = Math.floor(hoursOverSLA / 24);
      const remainingHours = hoursOverSLA % 24;

      if (days > 0) {
        return `${days} ${days === 1 ? 'dia' : 'dias'}${remainingHours > 0 ? ` e ${remainingHours} ${remainingHours === 1 ? 'hora' : 'horas'}` : ''} fora do SLA`;
      }
      
      return `${hoursOverSLA} ${hoursOverSLA === 1 ? 'hora' : 'horas'} fora do SLA`;
    } catch (e) {
      return null;
    }
  };

  const slaBreachTime = getSLABreachTime();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div 
        id="incident-details-modal"
        className="bg-[#151B2B] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Chamado {incident.Number}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
                {incident.State}
              </span>
              <span className="flex items-center gap-1 text-sm text-red-500">
                <Timer className="h-4 w-4" />
                Prioridade {incident.Priority}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#1C2333] rounded-lg transition-colors ml-2"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
          <h3 className="text-lg text-white">Descrição</h3>
          <p className="text-gray-300 mt-2">{incident.ShortDescription}</p>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Comments Section */}
          <div className="bg-[#1C2333] rounded-lg overflow-hidden">
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#1F2937] transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <span className="text-white font-medium">
                  Comentários e Notas de Trabalho
                </span>
              </div>
              {showComments ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {showComments && (
              <div className="p-4 border-t border-gray-700 max-h-[300px] overflow-y-auto">
                {incident.CommentsAndWorkNotes ? (
                  <div className="text-gray-300 whitespace-pre-wrap break-words">
                    {incident.CommentsAndWorkNotes.split('\n').map((line, index) => (
                      <div key={index} className="mb-2">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Nenhum comentário ou nota de trabalho disponível.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Solicitante</p>
                <p className="text-white">{incident.Caller}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Grupo Responsável</p>
                <p className="text-white">{normalizeLocationName(incident.AssignmentGroup)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Data de Abertura</p>
                <p className="text-white">{formatDate(incident.Opened)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Analista Responsável</p>
                <p className="text-white">{incident.AssignedTo || 'Não atribuído'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Categoria</p>
                <p className="text-white">{incident.Category || 'Não categorizado'}</p>
                {incident.Subcategory && (
                  <p className="text-sm text-gray-400">{incident.Subcategory}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Última Atualização</p>
                <p className="text-white">
                  {incident.Updated ? formatDate(incident.Updated) : 'Não atualizado'}
                </p>
                {incident.UpdatedBy && (
                  <p className="text-sm text-gray-400">por {incident.UpdatedBy}</p>
                )}
                {slaBreachTime && (
                  <div className="flex items-center gap-1 mt-1">
                    <Timer className="h-4 w-4 text-red-400" />
                    <p className="text-sm text-red-400">{slaBreachTime}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}