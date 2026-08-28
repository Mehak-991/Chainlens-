import React from 'react';
import { Supplier, RiskAnalysis } from '../services/api';

interface RiskSummaryProps {
  supplier: Supplier;
  analysis: RiskAnalysis;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({ supplier, analysis }) => {
  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'HIGH':
        return { bg: '#fee2e2', text: '#991b1b', border: '#f87171' };
      case 'MEDIUM':
        return { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' };
      case 'LOW':
      default:
        return { bg: '#d1fae5', text: '#065f46', border: '#34d399' };
    }
  };

  const colors = getTierColor(analysis.risk_tier);
  const isSupplierActive = supplier.status.toLowerCase() === 'active';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Profile Card */}
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#9ca3af',
            letterSpacing: '0.05em'
          }}>
            Supplier Profile
          </span>
          <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0 1rem 0', color: '#f3f4f6', fontWeight: 700 }}>
            {supplier.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#9ca3af', display: 'block' }}>ID Code</span>
              <strong style={{ color: '#e5e7eb' }}>{supplier.id}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af', display: 'block' }}>Operational Status</span>
              <strong style={{ color: isSupplierActive ? '#34d399' : '#f87171' }}>
                {supplier.status}
              </strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af', display: 'block' }}>Supply Tier</span>
              <strong style={{ color: '#e5e7eb' }}>{supplier.tier}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af', display: 'block' }}>Region / Country</span>
              <strong style={{ color: '#e5e7eb' }}>{supplier.country}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment Gauge Card */}
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        {/* Score Ring */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '10px solid #2d3748',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            border: `10px solid ${colors.border}`,
            clipPath: `polygon(50% 50%, -50% -50%, ${analysis.normalized_score * 3.6}% -50%)`,
            transform: 'rotate(-90deg)',
            opacity: 0.85
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f3f4f6' }}>
              {analysis.normalized_score}
            </span>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600 }}>
              Risk Index
            </span>
          </div>
        </div>

        {/* Severity Metrics Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, alignItems: 'flex-start' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#9ca3af',
            letterSpacing: '0.05em'
          }}>
            Evaluated Risk Level
          </span>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            marginBottom: '0.5rem'
          }}>
            {analysis.risk_tier}
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af', textAlign: 'left' }}>
            This derived score is computed directly by the service layer based on downstream blast radius and active high severity events.
          </p>
        </div>
      </div>
    </div>
  );
};
