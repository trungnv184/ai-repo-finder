import type { Repository } from '../../shared/types';
import { formatNumber } from '../utils/formatNumber';
import { formatRelativeDate } from '../utils/formatDate';

interface RepoCardProps {
  repo: Repository;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  R: '#198CE7',
  Julia: '#a270ba',
  Dart: '#00B4AB',
  Shell: '#89e051',
  PHP: '#4F5D95',
  Lua: '#000080',
  Zig: '#ec915c',
  Elixir: '#6e4a7e',
};

export function RepoCard({ repo }: RepoCardProps) {
  const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] || '#94a3b8') : undefined;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <img
          src={repo.owner.avatarUrl}
          alt={`${repo.owner.login}'s avatar`}
          style={styles.avatar}
        />
        <div style={styles.titleGroup}>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.name}
          >
            {repo.owner.login} / <strong>{repo.name}</strong>
          </a>
          {repo.owner.location && (
            <span style={styles.location} title={repo.owner.location}>
              <svg style={styles.locationIcon} viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.596 11.596a6.5 6.5 0 0 1-9.192-9.192 6.5 6.5 0 0 1 9.192 9.192ZM8 1.5A6.5 6.5 0 0 0 1.5 8 6.5 6.5 0 0 0 8 14.5 6.5 6.5 0 0 0 14.5 8 6.5 6.5 0 0 0 8 1.5Z" />
                <path d="M8 3a.75.75 0 0 1 .75.75v.5a4.5 4.5 0 0 1 3 3h.5a.75.75 0 0 1 0 1.5h-.5a4.5 4.5 0 0 1-3 3v.5a.75.75 0 0 1-1.5 0v-.5a4.5 4.5 0 0 1-3-3h-.5a.75.75 0 0 1 0-1.5h.5a4.5 4.5 0 0 1 3-3v-.5A.75.75 0 0 1 8 3Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
              </svg>
              {repo.owner.location}
            </span>
          )}
          {repo.language && (
            <span style={styles.language}>
              <span
                style={{
                  ...styles.languageDot,
                  backgroundColor: langColor,
                }}
              />
              {repo.language}
            </span>
          )}
        </div>
      </div>

      {repo.description && (
        <p style={styles.description}>{repo.description}</p>
      )}

      {repo.topics.length > 0 && (
        <div style={styles.topics}>
          {repo.topics.slice(0, 6).map((topic) => (
            <span key={topic} style={styles.topic}>
              {topic}
            </span>
          ))}
        </div>
      )}

      <div style={styles.stats}>
        <span style={styles.starStat} title="Stars">
          <svg style={styles.starIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
          {formatNumber(repo.stars)}
        </span>
        <span style={styles.stat} title="Forks">
          <svg style={styles.statIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878h-3v-.878a2.25 2.25 0 1 0-1.5 0ZM8 14.25a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Z" />
            <path d="M8 10.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
          </svg>
          {formatNumber(repo.forks)}
        </span>
        <span style={styles.stat} title="Open Issues">
          <svg style={styles.statIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
          </svg>
          {formatNumber(repo.openIssues)}
        </span>
        <span style={styles.updated}>
          Updated {formatRelativeDate(repo.updatedAt)}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: 'fadeIn 0.3s ease',
    boxShadow: 'var(--shadow-sm)',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
    minWidth: 0,
  },
  name: {
    fontSize: '1.05rem',
    color: 'var(--accent)',
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  locationIcon: {
    width: '12px',
    height: '12px',
    flexShrink: 0,
  },
  language: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    padding: '2px 8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
  },
  languageDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  topics: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  topic: {
    fontSize: '0.75rem',
    padding: '2px 10px',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    color: 'var(--accent)',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.15)',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
  starStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.85rem',
    color: 'var(--star-color)',
    fontWeight: 600,
  },
  starIcon: {
    width: '14px',
    height: '14px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  statIcon: {
    width: '14px',
    height: '14px',
  },
  updated: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
};
