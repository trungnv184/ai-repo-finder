import type { SortField, SortOrder } from '../../shared/types';

interface SortSelectorProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'stars', label: 'Stars' },
  { value: 'forks', label: 'Forks' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'name', label: 'Name' },
];

export function SortSelector({
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
}: SortSelectorProps) {
  return (
    <div style={styles.wrapper}>
      <label htmlFor="sort-field" style={styles.label}>
        Sort by
      </label>
      <select
        id="sort-field"
        style={styles.select}
        value={sortField}
        onChange={(e) => onSortFieldChange(e.target.value as SortField)}
        aria-label="Sort field"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        style={styles.toggleBtn}
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortOrder === 'asc' ? '\u2191' : '\u2193'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  select: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    cursor: 'pointer',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
  },
};
