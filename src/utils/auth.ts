export const getAuthToken = (): string | null => {
  return localStorage.getItem('basicAuthToken');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('basicAuthToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('basicAuthToken');
};

export const getLoggedInUsername = (): string | null => {
  const token = getAuthToken();
  if (token) {
    try {
      const decoded = atob(token);
      return decoded.split(':')[0] || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const isAdminUser = (): boolean => {
  const username = getLoggedInUsername();
  return username === 'admin' || username === 'administrador';
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};

export const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    clearAuthToken();
    window.location.reload(); // Force app to show login page again
    throw new Error('Unauthorized');
  }
};
