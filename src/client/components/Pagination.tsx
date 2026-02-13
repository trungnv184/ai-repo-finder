interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav style={styles.wrapper} aria-label="Pagination">
      <button
        style={{
          ...styles.button,
          ...(currentPage <= 1 ? styles.disabled : {}),
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        Previous
      </button>
      <span style={styles.info}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        style={{
          ...styles.button,
          ...(currentPage >= totalPages ? styles.disabled : {}),
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px 0',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  info: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
};
