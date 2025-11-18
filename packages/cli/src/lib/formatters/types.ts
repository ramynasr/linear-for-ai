export interface Issue {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  priority?: string;
  createdAt: string;
  updatedAt?: string;
  url: string;
  description?: string;
  project?: string;
  cycle?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  url: string;
}

export interface Cycle {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  progress: number;
  url: string;
}

export interface Team {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface PaginationInfo {
  hasNextPage: boolean;
  endCursor?: string;
  totalCount?: number;
}

export interface ListResult<T> {
  items: T[];
  pagination?: PaginationInfo;
}
