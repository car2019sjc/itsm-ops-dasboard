export const getIncidentState = (state: string): string => {
  if (!state) return 'Em Aberto';
  const s = state.toLowerCase().trim();
  
  // Cancelled state
  if (s.includes('canceled') || s.includes('cancelled') || s.includes('cancelado') || s.includes('cancelada')) {
    return 'Cancelado';
  }
  
  // Closed states
  if (s.includes('closed') || s.includes('resolved') || 
      s.includes('fechado') || s.includes('resolvido')) {
    return 'Fechado';
  }

  // On Hold states
  if (s.includes('on hold') || s.includes('hold') || s.includes('espera') || 
      s.includes('pending') || s.includes('pendente') || s.includes('aguardando')) {
    return 'Em Espera';
  }
  
  // In Progress states
  if (s.includes('assigned') || s.includes('progress') || 
      s.includes('andamento') || s.includes('atribuído') || 
      s.includes('em atendimento') || s.includes('working') ||
      s.includes('active') || s.includes('ativo') ||
      s.includes('processing') || s.includes('processando')) {
    return 'Em Andamento';
  }
  
  // Open states
  if (s.includes('opened') || s.includes('new') || s.includes('novo') || 
      s.includes('aberto') || s === '') {
    return 'Em Aberto';
  }
  
  // Default to Em Aberto for any other state
  return 'Em Aberto';
};

export const isHighPriority = (priority: string): boolean => {
  if (!priority) return false;
  const p = priority.toLowerCase().trim();
  
  // P1/Critical
  if (p === 'p1' || 
      p === '1' || 
      p === 'priority 1' || 
      p === 'critical' || 
      p === 'crítico' ||
      p.startsWith('p1 -') ||
      p.startsWith('p1-') ||
      p.startsWith('1 -') ||
      p.startsWith('1-') ||
      p.includes('critical') ||
      p.includes('crítico')) {
    return true;
  }
  
  // P2/High
  if (p === 'p2' || 
      p === '2' || 
      p === 'priority 2' || 
      p === 'high' || 
      p === 'alta' ||
      p.startsWith('p2 -') ||
      p.startsWith('p2-') ||
      p.startsWith('2 -') ||
      p.startsWith('2-') ||
      p.includes('high priority') ||
      p.includes('alta prioridade')) {
    return true;
  }

  return false;
};

export const isCancelled = (state: string): boolean => {
  if (!state) return false;
  const s = state.toLowerCase().trim();
  return s.includes('canceled') || 
         s.includes('cancelled') || 
         s.includes('cancelado') || 
         s.includes('cancelada');
};

export const isActiveIncident = (state: string): boolean => {
  if (!state) return true;
  const normalizedState = getIncidentState(state);
  return normalizedState !== 'Fechado' && normalizedState !== 'Cancelado';
};

export const normalizePriority = (priority: string): string => {
  if (!priority) return 'Não definido';
  
  const p = priority.toLowerCase().trim();
  
  // P1/Critical
  if (p === 'p1' || 
      p === '1' || 
      p === 'priority 1' || 
      p === 'critical' || 
      p === 'crítico' ||
      p.startsWith('p1 -') ||
      p.startsWith('p1-') ||
      p.startsWith('1 -') ||
      p.startsWith('1-') ||
      p.includes('critical') ||
      p.includes('crítico')) {
    return 'P1';
  }
  
  // P2/High
  if (p === 'p2' || 
      p === '2' || 
      p === 'priority 2' || 
      p === 'high' || 
      p === 'alta' ||
      p.startsWith('p2 -') ||
      p.startsWith('p2-') ||
      p.startsWith('2 -') ||
      p.startsWith('2-') ||
      p.includes('high priority') ||
      p.includes('alta prioridade')) {
    return 'P2';
  }
  
  // P3/Medium
  if (p === 'p3' || 
      p === '3' || 
      p === 'priority 3' || 
      p === 'medium' || 
      p === 'média' ||
      p.startsWith('p3 -') ||
      p.startsWith('p3-') ||
      p.startsWith('3 -') ||
      p.startsWith('3-') ||
      p.includes('medium priority') ||
      p.includes('média prioridade')) {
    return 'P3';
  }
  
  // P4/Low
  if (p === 'p4' || 
      p === '4' || 
      p === 'priority 4' || 
      p === 'low' || 
      p === 'baixa' ||
      p.startsWith('p4 -') ||
      p.startsWith('p4-') ||
      p.startsWith('4 -') ||
      p.startsWith('4-') ||
      p.includes('low priority') ||
      p.includes('baixa prioridade')) {
    return 'P4';
  }
  
  return 'Não definido';
};