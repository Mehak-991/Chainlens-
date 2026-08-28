import React from 'react';
import { RiskEventDetail } from '../services/api';

interface RiskEventsProps {
  events: RiskEventDetail[];
}

export const RiskEvents: React.FC<RiskEventsProps> = ({ events }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return { borderLeft: '4px solid #ef4444', badgeBg: '#fee2e2', badgeText: '#991b1b' };
      case 'medium':
        return { borderLeft: '4px solid #f59e0b', badgeBg: '#fef3c7', badgeText: '#92400e' };
      case 'low':
      default:
        return { borderLeft: '4px solid #10b981', badgeBg: '#d1fae5', badgeText: '#065f46' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#f3f4f6', fontWeight: 700, textAlign: 'left' }}>
        Active Risk Incidents
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'left' }}>
        Currently active external risk alerts linked to this supplier. Resolved notifications are excluded automatically.
      </p>

      {events.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px dashed #374151',
          color: '#9ca3af',
          fontSize: '0.9rem'
        }}>
          No active risk events affecting this supplier.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((e) => {
            const styles = getSeverityStyle(e.severity);
            return (
              <div
                key={e.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderLeft: styles.borderLeft,
                  textAlign: 'left',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flexGrow: 1, maxWidth: '80%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: styles.badgeBg,
                      color: styles.badgeText,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {e.severity} Severity
                    </span>
                    <strong style={{ color: '#e5e7eb', fontSize: '0.95rem' }}>{e.type}</strong>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>{e.description}</p>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {e.id}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
                  Start Date: {e.start_date}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
