import type { Repository } from '../../shared/types';
import { formatNumber } from '../utils/formatNumber';
import { formatRelativeDate } from '../utils/formatDate';

interface RepoCardProps {
  repo: Repository;
}

export function RepoCard({ repo }: RepoCardProps) {
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
          {repo.language && <span style={styles.language}>{repo.language}</span>}
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
        <span style={styles.stat} title="Stars">
          <svg style={styles.statIcon} viewBox="0 0 16 16" fill="currentColor">
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
  language: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
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
    backgroundColor: 'rgba(56, 139, 253, 0.15)',
    color: 'var(--accent)',
    borderRadius: '12px',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    paddingTop: '4px',
    borderTop: '1px solid var(--border-color)',
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
