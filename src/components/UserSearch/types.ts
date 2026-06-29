export interface Address {
  id?: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Dependent {
  id?: number;
  name: string;
  birthDate?: string;
  age?: number;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  addressEntity: Address;
  income: number;
  dependents: Dependent[];
  status: string;
  observations: string;
  photoPath?: string;
  startAssistanceDate?: string;
}

export interface SearchFilters {
  name: string;
  startAssistanceMonth: string;
  startAssistanceYear: string;
  status: string;
}

export type UserStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'BLOQUEADO';

export interface UserSearchProps {
  // Props opcionais para customização futura
  onUserSelect?: (user: User) => void;
  showActions?: boolean;
  maxResults?: number;
}