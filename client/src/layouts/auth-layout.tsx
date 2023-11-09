import { Navigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Logo from '../components/logo';
import { RootState } from '../store';
import { useSelector } from 'react-redux';
import { Suspense } from 'react';
import Loader from '../components/loader';

export default function AuthLayout() {
  const location = useLocation();

  const token = useSelector((state: RootState) => state.auth.access_token);
  if (token) return <Navigate to="/" />;

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center flex-col">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-80">
            <Loader />
          </div>
        }>
        <Logo />
        <div className="mt-6 bg-white border border-slate-300 rounded-3xl overflow-hidden max-w-[400px] w-full mb-24">
          <div className="">
            <h3 className="text-2xl font-semibold text-center border-b border-slate-300 p-3">
              {location.pathname === '/login' ? 'Login' : 'Register'}
            </h3>
          </div>

          <Outlet />
        </div>
      </Suspense>
    </div>
  );
}
