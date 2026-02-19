interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div style={styles.wrapper} role="alert">
      <svg style={styles.icon} viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
      <p style={styles.message}>{message}</p>
      {onRetry && (
        <button style={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
    textAlign: 'center',
  },
  icon: {
    width: '32px',
    height: '32px',
    color: 'var(--danger)',
  },
  message: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
  },
  retryBtn: {
    marginTop: '4px',
    padding: '8px 20px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    boxShadow: 'var(--shadow-sm)',
  },
};
