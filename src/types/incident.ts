export interface Incident {
  Number: string;
  Opened: string;
  ShortDescription: string;
  Caller: string;
  Priority: string;
  State: string;
  Category: string;
  Subcategory: string;
  AssignmentGroup: string;
  AssignedTo: string;
  Updated: string;
  UpdatedBy: string;
  BusinessImpact: string;
  ResponseTime: string;
  Location?: string;
  CommentsAndWorkNotes?: string;
}

export interface IncidentStats {
  totalByCategory: Record<string, number>;
  totalBySubcategory: Record<string, number>;
  totalByAssignmentGroup: Record<string, number>;
  totalByPriority: Record<string, number>;
  topCallers: Array<{ caller: string; count: number }>;
  slaCompliance: {
    total: number;
    compliant: number;
    percentage: number;
  };
}