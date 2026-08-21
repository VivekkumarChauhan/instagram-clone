import {
  useAuthStore,
  selectUser,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from '@store/authStore';

export function useAuth() {
  const user = useAuthStore(selectUser);
  const status = useAuthStore(selectAuthStatus);
  const error = useAuthStore(selectAuthError);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const login = useAuthStore(s => s.login);
  const signUp = useAuthStore(s => s.signUp);
  const logout = useAuthStore(s => s.logout);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const clearError = useAuthStore(s => s.clearError);

  return {
    user,
    status,
    error,
    isAuthenticated,
    isLoading: status === 'loading',
    login,
    signUp,
    logout,
    updateProfile,
    clearError,
  };
}
