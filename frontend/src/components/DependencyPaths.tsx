import React from 'react';
import { DependencyPath } from '../services/api';

interface DependencyPathsProps {
  paths: DependencyPath[];
}

export const DependencyPaths: React.FC<DependencyPathsProps> = ({ paths }) => {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#f3f4f6', fontWeight: 700, textAlign: 'left' }}>
        Downstream Dependency Chains Preview
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'left' }}>
        Linear trace paths showing how disruptions propagate downstream from the Supplier node through components, products, and manufacturing plants.
      </p>

      {paths.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px dashed #374151',
          color: '#9ca3af',
          fontSize: '0.9rem'
        }}>
          No downstream dependency paths configured.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {paths.map((p, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#e5e7eb',
                justifyContent: 'flex-start'
              }}
            >
              {p.nodes.map((node, nodeIdx) => (
                <React.Fragment key={nodeIdx}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    minWidth: '80px'
                  }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700 }}>
                      {node.label}
                    </span>
                    <strong style={{ fontSize: '0.8rem', color: '#f3f4f6' }}>{node.name}</strong>
                  </div>
                  {nodeIdx < p.nodes.length - 1 && (
                    <span style={{ color: '#60a5fa', fontWeight: 800, padding: '0 0.25rem' }}>
                      &rarr;
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
