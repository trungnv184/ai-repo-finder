import { formatRelativeDate } from '../utils/formatDate';

interface HeaderProps {
  lastFetched?: string | null;
  fromCache?: boolean;
}

export function Header({ lastFetched, fromCache }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>
            <svg style={styles.logo} viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            AI Repo Finder
          </h1>
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
        <p style={styles.subtitle}>
          Discover trending AI and machine learning repositories on GitHub
        </p>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '24px 0',
    marginBottom: '24px',
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
    gap: '12px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  logo: {
    width: '28px',
    height: '28px',
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
    backgroundColor: 'rgba(63, 185, 80, 0.15)',
    color: 'var(--success)',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  subtitle: {
    marginTop: '6px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
};
