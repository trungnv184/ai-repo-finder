import { formatRelativeDate } from '../utils/formatDate';

interface HeaderProps {
  lastFetched?: string | null;
  fromCache?: boolean;
}

function Logo() {
  return (
    <svg
      style={styles.logo}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Magnifying glass body */}
      <circle
        cx="52"
        cy="52"
        r="36"
        stroke="#3b82f6"
        strokeWidth="6"
        fill="#eff6ff"
      />
      {/* Glass highlight */}
      <circle
        cx="52"
        cy="52"
        r="30"
        stroke="#93c5fd"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Handle */}
      <line
        x1="78"
        y1="78"
        x2="108"
        y2="108"
        stroke="#3b82f6"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Neural network nodes */}
      <circle cx="40" cy="38" r="4" fill="#3b82f6" />
      <circle cx="64" cy="38" r="4" fill="#3b82f6" />
      <circle cx="52" cy="52" r="5" fill="#2563eb" />
      <circle cx="36" cy="58" r="3.5" fill="#60a5fa" />
      <circle cx="68" cy="58" r="3.5" fill="#60a5fa" />
      <circle cx="44" cy="68" r="3" fill="#93c5fd" />
      <circle cx="60" cy="68" r="3" fill="#93c5fd" />
      {/* Neural connections */}
      <line x1="40" y1="38" x2="52" y2="52" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="64" y1="38" x2="52" y2="52" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="52" y1="52" x2="36" y2="58" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="52" y1="52" x2="68" y2="58" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="36" y1="58" x2="44" y2="68" stroke="#bfdbfe" strokeWidth="1" />
      <line x1="68" y1="58" x2="60" y2="68" stroke="#bfdbfe" strokeWidth="1" />
      <line x1="40" y1="38" x2="36" y2="58" stroke="#bfdbfe" strokeWidth="1" />
      <line x1="64" y1="38" x2="68" y2="58" stroke="#bfdbfe" strokeWidth="1" />
      <line x1="44" y1="68" x2="60" y2="68" stroke="#bfdbfe" strokeWidth="1" />
    </svg>
  );
}

export function Header({ lastFetched, fromCache }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.titleRow}>
          <div style={styles.titleGroup}>
            <Logo />
            <div>
              <h1 style={styles.title}>AI Repo Finder</h1>
              <p style={styles.subtitle}>
                Discover trending AI repositories on GitHub
              </p>
            </div>
          </div>
          <div style={styles.meta}>
            {lastFetched && (
              <span style={styles.metaItem}>
                Last updated: {formatRelativeDate(lastFetched)}
              </span>
            )}
            {fromCache && (
              <span style={styles.cacheBadge} title="Data served from cache">
                cached
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
    borderBottom: '1px solid var(--border-color)',
    padding: '28px 0',
    marginBottom: '24px',
    boxShadow: 'var(--shadow-sm)',
  },
  container: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 24px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  logo: {
    width: '42px',
    height: '42px',
    flexShrink: 0,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  metaItem: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  cacheBadge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: 'var(--success)',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontWeight: 600,
    border: '1px solid rgba(34, 197, 94, 0.2)',
  },
  subtitle: {
    marginTop: '2px',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
};
