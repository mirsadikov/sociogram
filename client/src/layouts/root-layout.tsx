import { Navigate, Outlet } from 'react-router-dom';
import MainSidebar from '../components/main-sidebar';
import { RootState } from '../store';
import { useSelector } from 'react-redux';

export default function RootLayout() {
  const token = useSelector((state: RootState) => state.auth.access_token);
  if (!token) return <Navigate to="/login" />;

  return (
    <div className="max-w-[1280px] flex w-full mx-auto">
      <MainSidebar />
      <Outlet />
    </div>
  );
}
