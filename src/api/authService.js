import apiClient from './client';

export const authService = {
  // Register new user
  // Request: { username: string, password: string }
  // Response: "User registered successfully"
  register: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, password });
      return response;
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  },

  // Login and get JWT token
  // Request: { username: string, password: string }
  // Response: { jwtToken: string }
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      // Validate response format
      if (!response?.jwtToken) {
        throw new Error('Invalid response format: missing jwtToken');
      }
      // Store token in localStorage for subsequent requests.
      // Admin status is no longer inferred from credentials — it is derived from the
      // backend role via the admin probe in LicenseContext (see LicenseProvider).
      localStorage.setItem('jwtToken', response.jwtToken);
      // There is no profile endpoint, so the username typed at login is the only
      // place we can get it from — persist it for display elsewhere in the UI.
      localStorage.setItem('username', username);
      return response;
    } catch (error) {
      console.error('Failed to login user:', error);
      throw error;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('isAdmin'); // clean up the legacy client-side admin flag
      localStorage.removeItem('username');
    } catch (error) {
      console.error('Failed to logout user:', error);
      throw error;
    }
  },
};
