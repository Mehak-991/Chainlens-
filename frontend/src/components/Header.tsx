import React from 'react';

interface HeaderProps {
  onRefresh: () => void;
  dbStatus: string;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, dbStatus }) => {
  const isConnected = dbStatus === 'connected';

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #374151',
      paddingBottom: '1.5rem',
      marginBottom: '2.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          margin: 0,
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ChainLens
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: '#9ca3af', fontSize: '0.95rem' }}>
          Supply Chain Risk Explorer & Downstream Impact Monitor
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          backgroundColor: isConnected ? '#064e3b' : '#7f1d1d',
          color: isConnected ? '#34d399' : '#f87171',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: `1px solid ${isConnected ? '#047857' : '#b91c1c'}`
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            display: 'inline-block'
          }} />
          Database: {dbStatus.toUpperCase()}
        </div>
        <button
          onClick={onRefresh}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#374151',
            color: '#f3f4f6',
            border: '1px solid #4b5563',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
        >
          Refresh
        </button>
      </div>
    </header>
  );
};
