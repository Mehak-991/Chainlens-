import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle }) => {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem' }}>
        {title}
      </span>
      <strong style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1, marginBottom: '0.5rem' }}>
        {value}
      </strong>
      <span style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'left' }}>
        {subtitle}
      </span>
    </div>
  );
};
