import React, { useState, useEffect } from 'react';
import { api, Supplier, SupplierImpactAnalysis, DependencyPath } from '../services/api';
import { Header } from '../components/Header';
import { SupplierSelector } from '../components/SupplierSelector';
import { RiskSummary } from '../components/RiskSummary';
import { MetricCard } from '../components/MetricCard';
import { RiskExplanation } from '../components/RiskExplanation';
import { CriticalDependencies } from '../components/CriticalDependencies';
import { AlternativeSuppliers } from '../components/AlternativeSuppliers';
import { RiskEvents } from '../components/RiskEvents';
import { DependencyPaths } from '../components/DependencyPaths';
import { DependencyGraph } from '../components/DependencyGraph';

export const Dashboard: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<string>('checking...');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [impactData, setImpactData] = useState<SupplierImpactAnalysis | null>(null);
  const [paths, setPaths] = useState<DependencyPath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial workspace status load
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check API/Database health
      const health = await api.getHealth();
      setDbStatus(health.database);

      // Fetch Supplier list
      const supplierList = await api.getSuppliers();
      setSuppliers(supplierList);

      // Select default supplier (preferably sup-01 hero if active, otherwise first item)
      if (supplierList.length > 0) {
        const defaultSupplier = supplierList.find(s => s.id === 'sup-01') || supplierList[0];
        setSelectedSupplierId(defaultSupplier.id);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      loggerError(err);
      setError('Unable to connect to ChainLens API. Confirm backend is running on local port 8000.');
      setLoading(false);
    }
  };

  const loggerError = (err: any) => {
    console.error('API integration exception:', err);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 2. Fetch details when supplier changes
  useEffect(() => {
    if (!selectedSupplierId) return;

    const fetchSupplierDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const impactResult = await api.getSupplierImpact(selectedSupplierId);
        setImpactData(impactResult);

        const pathsResult = await api.getSupplierPaths(selectedSupplierId);
        setPaths(pathsResult);
      } catch (err: any) {
        loggerError(err);
        setError(`Failed to fetch supply chain disruption records for supplier '${selectedSupplierId}'.`);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDetails();
  }, [selectedSupplierId]);

  const handleSupplierChange = (id: string) => {
    setSelectedSupplierId(id);
  };

  const getSelectedSupplierObject = (): Supplier | undefined => {
    return suppliers.find(s => s.id === selectedSupplierId);
  };

  const activeSupplier = getSelectedSupplierObject();

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: '1200px', margin: '0 auto', color: '#f3f4f6' }}>
      <Header onRefresh={loadInitialData} dbStatus={dbStatus} />

      {error && (
        <div style={{
          backgroundColor: '#7f1d1d',
          border: '1px solid #b91c1c',
          borderRadius: '8px',
          padding: '1rem',
          color: '#fca5a5',
          textAlign: 'left',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <strong>Operational Error:</strong> {error}
        </div>
      )}

      {loading && !impactData ? (
        <div style={{ padding: '4rem', fontSize: '1.25rem', color: '#9ca3af' }}>
          Querying supply chain topology, please wait...
        </div>
      ) : (
        <>
          <SupplierSelector
            suppliers={suppliers}
            selectedId={selectedSupplierId}
            onChange={handleSupplierChange}
            disabled={loading}
          />

          {activeSupplier && impactData && (
            <div style={{ transition: 'opacity 0.2s', opacity: loading ? 0.6 : 1 }}>
              {/* Profile and Gauge Row */}
              <RiskSummary supplier={activeSupplier} analysis={impactData.risk_analysis} />

              {/* Grid cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem'
              }}>
                <MetricCard
                  title="Supplied Components"
                  value={impactData.metrics.supplied_components}
                  subtitle="Unique catalog entries provided"
                />
                <MetricCard
                  title="Downstream Products"
                  value={impactData.metrics.affected_products}
                  subtitle="Affected finished products"
                />
                <MetricCard
                  title="Affected Factories"
                  value={impactData.metrics.affected_factories}
                  subtitle="Impacted B2B manufacturing plants"
                />
                <MetricCard
                  title="Risk Footprint Regions"
                  value={impactData.metrics.affected_regions}
                  subtitle="Downstream geographic regions"
                />
                <MetricCard
                  title="Single-Source Bottlenecks"
                  value={impactData.critical_dependencies.length}
                  subtitle="Components supplied exclusively by this vendor"
                />
                <MetricCard
                  title="Active High Severity Alerts"
                  value={impactData.risk_analysis.high_severity_active_events_count}
                  subtitle="Unresolved logistics incident warnings"
                />
              </div>

              {/* Main analytics panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <DependencyGraph
                  paths={paths}
                  selectedSupplierId={selectedSupplierId}
                  riskTier={impactData.risk_analysis.risk_tier}
                />

                <RiskExplanation
                  metrics={{
                    supplied_components: impactData.metrics.supplied_components,
                    affected_products: impactData.metrics.affected_products,
                    affected_factories: impactData.metrics.affected_factories,
                    affected_regions: impactData.metrics.affected_regions
                  }}
                  singleSourceCount={impactData.critical_dependencies.length}
                  highSeverityActiveEventsCount={impactData.risk_analysis.high_severity_active_events_count}
                  rawScore={impactData.risk_analysis.raw_score}
                  normalizedScore={impactData.risk_analysis.normalized_score}
                  riskTier={impactData.risk_analysis.risk_tier}
                />

                <CriticalDependencies dependencies={impactData.critical_dependencies} />

                <AlternativeSuppliers alternatives={impactData.alternatives} />

                <RiskEvents events={impactData.active_risk_events} />

                <DependencyPaths paths={paths} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

