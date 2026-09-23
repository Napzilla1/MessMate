import { useSelector, useDispatch } from 'react-redux';
import { loginThunk, registerThunk, logoutAction } from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  return {
    user,
    loading,
    login: async (email, password) => await dispatch(loginThunk({ email, password })).unwrap(),
    register: async (userData) => await dispatch(registerThunk(userData)).unwrap(),
    logout: () => dispatch(logoutAction()),
  };
}
