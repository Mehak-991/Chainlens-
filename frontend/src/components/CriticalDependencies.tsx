import React from 'react';
import { CriticalDependency } from '../services/api';

interface CriticalDependenciesProps {
  dependencies: CriticalDependency[];
}

export const CriticalDependencies: React.FC<CriticalDependenciesProps> = ({ dependencies }) => {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#f3f4f6', fontWeight: 700, textAlign: 'left' }}>
        Critical Single-Source Components
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'left' }}>
        These elements are supplied exclusively by this supplier. Disruption poses a high supply risk as no other approved alternative sources are pre-configured in the repository.
      </p>

      {dependencies.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px dashed #374151',
          color: '#9ca3af',
          fontSize: '0.9rem'
        }}>
          No critical single-source components detected for this supplier.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Component Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Criticality</th>
                <th style={{ padding: '0.75rem 1rem' }}>Alternative Supplier Count</th>
                <th style={{ padding: '0.75rem 1rem' }}>Risk Indicator</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep) => (
                <tr key={dep.component_id} style={{ borderBottom: '1px solid #2d3748', fontSize: '0.9rem', color: '#e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{dep.component_name}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#9ca3af' }}>{dep.component_id}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: dep.criticality.toLowerCase() === 'high' ? '#7f1d1d' : '#374151',
                      color: dep.criticality.toLowerCase() === 'high' ? '#fca5a5' : '#d1d5db',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {dep.criticality}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{dep.supplier_count}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#7f1d1d',
                      color: '#fca5a5',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Single Source Bottleneck
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
