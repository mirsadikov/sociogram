import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import MainSidebar from '../components/main-sidebar';
import { RootState, store } from '../store';
import { useSelector } from 'react-redux';
import { socket, startListening, stopListening } from '../socket';
import { login, setProfile } from '../store/slices/auth-slice';
import httpClient, { refreshAccessToken } from '../api/httpClient';
import { useQuery } from '@tanstack/react-query';

export default function RootLayout() {
  const token = useSelector((state: RootState) => state.auth.access_token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate('/login');
    socket.auth = { token };

    if (socket.connected) return;

    socket.connect();
    startListening();

    return () => {
      stopListening();
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await refreshAccessToken();

      if ('access_token' in res) store.dispatch(login(res.access_token));
      else store.dispatch({ type: 'logout' });
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  const { data } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await httpClient.get(`/user/profile`);

      return data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      store.dispatch(setProfile(data));
    }
  }, [data]);

  return token ? (
    <div className="max-w-[1280px] flex w-full mx-auto">
      <MainSidebar />
      <Outlet />
    </div>
  ) : (
    <Navigate to="/login" replace={true} />
  );
}
