export interface Supplier {
  id: string;
  name: string;
  tier: string;
  country: string;
  status: string;
}

export interface ImpactMetrics {
  supplied_components: number;
  affected_products: number;
  affected_factories: number;
  affected_regions: number;
}

export interface RiskAnalysis {
  raw_score: number;
  normalized_score: number;
  risk_tier: string;
  high_severity_active_events_count: number;
}

export interface CriticalDependency {
  component_id: string;
  component_name: string;
  criticality: string;
  supplier_count: number;
}

export interface AlternativeMapping {
  component_id: string;
  component_name: string;
  potential_alternatives: string[];
  approved_alternatives: Array<{
    id: string;
    compatibility: string;
    switching_days: number;
  }>;
}

export interface RiskEventDetail {
  id: string;
  type: string;
  severity: string;
  description: string;
  start_date: string;
}

export interface SupplierImpactAnalysis {
  supplier_exists: boolean;
  supplier_id: string;
  metrics: ImpactMetrics;
  risk_analysis: RiskAnalysis;
  critical_dependencies: CriticalDependency[];
  alternatives: AlternativeMapping[];
  active_risk_events: RiskEventDetail[];
}

export interface DependencyPath {
  nodes: Array<{ id: string; label: string; name: string }>;
  relationships: string[];
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getHealth: () => fetchJson<{ status: string; database: string }>('/api/health'),
  getSuppliers: () => fetchJson<Supplier[]>('/api/suppliers'),
  getSupplierImpact: (id: string) => fetchJson<SupplierImpactAnalysis>(`/api/suppliers/${id}/impact`),
  getSupplierAlternatives: (id: string) => fetchJson<AlternativeMapping[]>(`/api/suppliers/${id}/alternatives`),
  getSupplierRiskEvents: (id: string) => fetchJson<RiskEventDetail[]>(`/api/suppliers/${id}/risk-events`),
  getCriticalDependencies: (id: string) => fetchJson<CriticalDependency[]>(`/api/suppliers/${id}/critical-dependencies`),
  getSupplierPaths: (id: string) => fetchJson<DependencyPath[]>(`/api/suppliers/${id}/paths`),
};
