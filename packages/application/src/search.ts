import type { SearchHit, SearchRebuildResult, StableId } from '@dreamstory/contracts';

import type { RepositorySet, SearchRepository } from './repositories.js';

export class SearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchValidationError';
  }
}

export class ContinuitySearchService {
  private readonly searchRepository: SearchRepository;

  constructor(repositories: Pick<RepositorySet, 'search'>) {
    this.searchRepository = repositories.search;
  }

  async rebuild(bookId: StableId): Promise<SearchRebuildResult> {
    return this.searchRepository.rebuild(bookId);
  }

  async search(bookId: StableId, query: string, limit = 20): Promise<readonly SearchHit[]> {
    if (query.trim() === '') throw new SearchValidationError('Search query must not be empty.');
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new SearchValidationError('Search limit must be between 1 and 100.');
    }
    return this.searchRepository.search(bookId, query.trim(), limit);
  }
}
