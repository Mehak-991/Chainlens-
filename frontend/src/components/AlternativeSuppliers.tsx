import React from 'react';
import { AlternativeMapping } from '../services/api';

interface AlternativeSuppliersProps {
  alternatives: AlternativeMapping[];
}

export const AlternativeSuppliers: React.FC<AlternativeSuppliersProps> = ({ alternatives }) => {
  // Aggregate alternatives across components for simplified dashboard mapping
  const hasAlternatives = alternatives.some(
    (alt) => alt.potential_alternatives.length > 0 || alt.approved_alternatives.length > 0
  );

  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#f3f4f6', fontWeight: 700, textAlign: 'left' }}>
        Alternative Suppliers Analysis
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'left' }}>
        Disruption workarounds map both dynamic potential alternatives (sharing identical parts catalog entries) and approved contracted replacements (`ALTERNATIVE_TO` parameters).
      </p>

      {!hasAlternatives ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px dashed #374151',
          color: '#9ca3af',
          fontSize: '0.9rem'
        }}>
          No potential or approved alternative suppliers found in database configurations.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {alternatives.map((alt) => {
            const hasPotential = alt.potential_alternatives.length > 0;
            const hasApproved = alt.approved_alternatives.length > 0;

            if (!hasPotential && !hasApproved) return null;

            return (
              <div key={alt.component_id} style={{
                backgroundColor: '#111827',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'left'
              }}>
                <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  Component: {alt.component_name} <span style={{ color: '#6b7280', fontSize: '0.8rem', fontFamily: 'monospace' }}>({alt.component_id})</span>
                </strong>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {/* Approved alternative section */}
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#34d399', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                      Approved Alternative Channels
                    </span>
                    {!hasApproved ? (
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>None pre-approved.</span>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#e5e7eb' }}>
                        {alt.approved_alternatives.map((app) => (
                          <li key={app.id} style={{ marginBottom: '0.25rem' }}>
                            Supplier ID: <strong>{app.id}</strong> (Lead: {app.switching_days} days, Compatibility: {app.compatibility})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Potential alternative section */}
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                      Potential Alternatives (Overlapping Catalog)
                    </span>
                    {!hasPotential ? (
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>No suppliers share this part inventory.</span>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#e5e7eb' }}>
                        {alt.potential_alternatives.map((pot) => (
                          <li key={pot} style={{ marginBottom: '0.25rem' }}>
                            Supplier ID: <strong>{pot}</strong> (Capability verified)
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
