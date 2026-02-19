import { useState } from 'react';

interface LocationFilterProps {
  value: string;
  onChange: (location: string) => void;
}

const LOCATION_OPTIONS = [
  { label: 'All Countries', value: '' },
  { label: 'United States', value: 'United States' },
  { label: 'China', value: 'China' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Germany', value: 'Germany' },
  { label: 'India', value: 'India' },
  { label: 'Japan', value: 'Japan' },
  { label: 'France', value: 'France' },
  { label: 'Canada', value: 'Canada' },
  { label: 'South Korea', value: 'South Korea' },
  { label: 'Israel', value: 'Israel' },
];

const CUSTOM_VALUE = '__custom__';

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  const isCustom = value !== '' && !LOCATION_OPTIONS.some((opt) => opt.value === value);
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === CUSTOM_VALUE) {
      setShowCustomInput(true);
      onChange('');
    } else {
      setShowCustomInput(false);
      onChange(selected);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const selectValue = showCustomInput
    ? CUSTOM_VALUE
    : LOCATION_OPTIONS.some((opt) => opt.value === value) ? value : CUSTOM_VALUE;

  return (
    <div style={styles.wrapper}>
      <svg
        style={styles.icon}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.596 11.596a6.5 6.5 0 0 1-9.192-9.192 6.5 6.5 0 0 1 9.192 9.192ZM8 1.5A6.5 6.5 0 0 0 1.5 8 6.5 6.5 0 0 0 8 14.5 6.5 6.5 0 0 0 14.5 8 6.5 6.5 0 0 0 8 1.5Z" />
        <path d="M8 3a.75.75 0 0 1 .75.75v.5a4.5 4.5 0 0 1 3 3h.5a.75.75 0 0 1 0 1.5h-.5a4.5 4.5 0 0 1-3 3v.5a.75.75 0 0 1-1.5 0v-.5a4.5 4.5 0 0 1-3-3h-.5a.75.75 0 0 1 0-1.5h.5a4.5 4.5 0 0 1 3-3v-.5A.75.75 0 0 1 8 3Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      </svg>
      <select
        style={styles.select}
        value={selectValue}
        onChange={handleSelectChange}
        aria-label="Filter by location"
      >
        {LOCATION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        <option value={CUSTOM_VALUE}>Other...</option>
      </select>
      {showCustomInput && (
        <input
          style={styles.customInput}
          type="text"
          placeholder="Enter location..."
          value={value}
          onChange={handleCustomChange}
          aria-label="Custom location filter"
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    width: '16px',
    height: '16px',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  select: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '140px',
  },
  customInput: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    width: '150px',
  },
};
