import { useState } from 'react';
import type { SortField, SortOrder } from '../../shared/types';
import { useDebounce } from '../hooks/useDebounce';
import { useRepos } from '../hooks/useRepos';
import { SearchBar } from './SearchBar';
import { SortSelector } from './SortSelector';
import { RepoCard } from './RepoCard';
import { Pagination } from './Pagination';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

export function RepoList() {
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('stars');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query);

  const { repos, loading, error, pagination, refetch } = useRepos({
    query: debouncedQuery,
    sortField,
    sortOrder,
    page,
    perPage: 20,
  });

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleSortFieldChange = (field: SortField) => {
    setSortField(field);
    setPage(1);
  };

  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    setPage(1);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.controls}>
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          resultCount={pagination.totalCount}
        />
        <SortSelector
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={handleSortFieldChange}
          onSortOrderChange={handleSortOrderChange}
        />
      </div>

      {loading && <LoadingSpinner message="Fetching repositories..." />}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && repos.length === 0 && <EmptyState />}

      {!loading && !error && repos.length > 0 && (
        <>
          <div style={styles.list}>
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 24px 48px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '24px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};
