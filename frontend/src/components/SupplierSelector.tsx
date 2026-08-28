import React from 'react';
import { Supplier } from '../services/api';

interface SupplierSelectorProps {
  suppliers: Supplier[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export const SupplierSelector: React.FC<SupplierSelectorProps> = ({
  suppliers,
  selectedId,
  onChange,
  disabled = false
}) => {
  return (
    <div style={{
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      alignItems: 'flex-start',
      width: '100%',
      maxWidth: '400px'
    }}>
      <label
        htmlFor="supplier-select"
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#9ca3af'
        }}
      >
        Analyze Disruption Impact for Supplier:
      </label>
      <select
        id="supplier-select"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          backgroundColor: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151',
          fontSize: '1rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <option value="" disabled>-- Select a Supplier --</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.tier} - {s.country})
          </option>
        ))}
      </select>
    </div>
  );
};
