export interface FilterOption {
  key: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchCriteria {
  query?: string;
  filters?: FilterOption[];
  sort?: SortOption;
  page?: number;
  size?: number;
}
