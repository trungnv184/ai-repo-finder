/**
 * Represents a GitHub repository owner
 */
export interface Owner {
  login: string;
  avatarUrl: string;
  location?: string | null;
}

/**
 * Represents a GitHub repository with all relevant metadata
 */
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: Owner;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}
