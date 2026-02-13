import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RepoCard } from '../../../src/client/components/RepoCard';
import type { Repository } from '../../../src/shared/types';

function createMockRepo(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    name: 'test-repo',
    fullName: 'owner/test-repo',
    owner: {
      login: 'owner',
      avatarUrl: 'https://example.com/avatar.png',
    },
    description: 'A test repository for AI',
    url: 'https://github.com/owner/test-repo',
    stars: 1500,
    forks: 300,
    openIssues: 42,
    language: 'Python',
    topics: ['machine-learning', 'deep-learning', 'ai'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    pushedAt: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('RepoCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the repository name', () => {
    const repo = createMockRepo();
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('test-repo')).toBeInTheDocument();
  });

  it('should render the owner login', () => {
    const repo = createMockRepo();
    render(<RepoCard repo={repo} />);

    expect(screen.getByText(/owner/)).toBeInTheDocument();
  });

  it('should render the description', () => {
    const repo = createMockRepo({ description: 'An amazing AI project' });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('An amazing AI project')).toBeInTheDocument();
  });

  it('should not render description when null', () => {
    const repo = createMockRepo({ description: null });
    render(<RepoCard repo={repo} />);

    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('should render formatted star count', () => {
    const repo = createMockRepo({ stars: 1500 });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('1.5k')).toBeInTheDocument();
  });

  it('should render formatted fork count', () => {
    const repo = createMockRepo({ forks: 300 });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('should render the language', () => {
    const repo = createMockRepo({ language: 'TypeScript' });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should not render language when null', () => {
    const repo = createMockRepo({ language: null });
    render(<RepoCard repo={repo} />);

    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('should render topics', () => {
    const repo = createMockRepo({
      topics: ['pytorch', 'transformers', 'nlp'],
    });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('pytorch')).toBeInTheDocument();
    expect(screen.getByText('transformers')).toBeInTheDocument();
    expect(screen.getByText('nlp')).toBeInTheDocument();
  });

  it('should not render topics section when topics array is empty', () => {
    const repo = createMockRepo({ topics: [] });
    const { container } = render(<RepoCard repo={repo} />);

    // No topic spans should be rendered
    const topicElements = container.querySelectorAll('[style*="rgba(56, 139, 253"]');
    expect(topicElements).toHaveLength(0);
  });

  it('should limit displayed topics to 6', () => {
    const repo = createMockRepo({
      topics: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'],
    });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText('t1')).toBeInTheDocument();
    expect(screen.getByText('t6')).toBeInTheDocument();
    expect(screen.queryByText('t7')).not.toBeInTheDocument();
    expect(screen.queryByText('t8')).not.toBeInTheDocument();
  });

  it('should render repo link that opens in new tab', () => {
    const repo = createMockRepo({
      url: 'https://github.com/owner/test-repo',
    });
    render(<RepoCard repo={repo} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/owner/test-repo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render the owner avatar', () => {
    const repo = createMockRepo();
    render(<RepoCard repo={repo} />);

    const avatar = screen.getByAltText("owner's avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('should display relative date for updatedAt', () => {
    const repo = createMockRepo({
      updatedAt: '2024-06-14T12:00:00Z',
    });
    render(<RepoCard repo={repo} />);

    expect(screen.getByText(/Updated 1 day ago/)).toBeInTheDocument();
  });
});
