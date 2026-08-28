import React from 'react';

interface RiskExplanationProps {
  metrics: {
    supplied_components: number;
    affected_products: number;
    affected_factories: number;
    affected_regions: number;
  };
  singleSourceCount: number;
  highSeverityActiveEventsCount: number;
  rawScore: number;
  normalizedScore: number;
  riskTier: string;
}

export const RiskExplanation: React.FC<RiskExplanationProps> = ({
  metrics,
  singleSourceCount,
  highSeverityActiveEventsCount,
  rawScore,
  normalizedScore,
  riskTier
}) => {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      textAlign: 'left'
    }}>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#f3f4f6', fontWeight: 700 }}>
        Risk Assessment Methodology
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>
        The risk rating index is an explainable business metrics calculation evaluated dynamically at request time using the frozen supply-chain formula:
      </p>

      {/* Formula visualization block */}
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #2d3748',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: '#e5e7eb',
        lineHeight: 1.6
      }}>
        <div>Raw Risk Score = (affected_products &times; 2) + (affected_factories &times; 3) + (single_source_components &times; 4) + (high_severity_active_events &times; 5)</div>
        <div style={{ marginTop: '0.5rem', color: '#9ca3af' }}>
          Normalized Score = Min(100, Round(Raw Score / 1.5))
        </div>
      </div>

      {/* Detailed calculations summary list */}
      <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem 0', color: '#f3f4f6', fontWeight: 600 }}>
        Supplier Disruption Impact Factors Matrix:
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem' }}>
          <span>Affected Downstream Products</span>
          <span><strong>{metrics.affected_products}</strong> &times; 2 = <strong>{metrics.affected_products * 2}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem' }}>
          <span>Affected Assembly Factories</span>
          <span><strong>{metrics.affected_factories}</strong> &times; 3 = <strong>{metrics.affected_factories * 3}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem' }}>
          <span>Critical Single-Source Components</span>
          <span><strong>{singleSourceCount}</strong> &times; 4 = <strong>{singleSourceCount * 4}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem' }}>
          <span>Active High Severity Events</span>
          <span><strong>{highSeverityActiveEventsCount}</strong> &times; 5 = <strong>{highSeverityActiveEventsCount * 5}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', color: '#f3f4f6', fontWeight: 700 }}>
          <span>Total Raw Score / Normalized Value</span>
          <span>{rawScore} / <span style={{ color: '#60a5fa' }}>{normalizedScore} ({riskTier})</span></span>
        </div>
      </div>
    </div>
  );
};
