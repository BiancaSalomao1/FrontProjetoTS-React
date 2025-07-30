export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  income: number;
  numOfDependents: number;
  status: string;
  observations: string;
  photo?: string;
}

export interface SearchFilters {
  name: string;
  email: string;
  status: string;
}

export type UserStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'BLOQUEADO';

export interface UserSearchProps {
  // Props opcionais para customização futura
  onUserSelect?: (user: User) => void;
  showActions?: boolean;
  maxResults?: number;
}