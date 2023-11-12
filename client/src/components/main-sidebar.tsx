import { Tooltip, Skeleton } from 'antd';
import { NavLink } from 'react-router-dom';
import { Bell, ChatDots, HomeAlt1, MoreHorizontalFill, Person, Search } from 'akar-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '../store';
import Logo from './logo';
import httpClient from '../api/httpClient';
import DefaultProfile from '../images/default_profile.png';
import { User } from '../types';
import { useEffect } from 'react';
import { setProfile } from '../store/slices/auth-slice';

const links = [
  {
    name: 'Home',
    path: '/',
    Icon: HomeAlt1,
  },
  {
    name: 'Search',
    path: '/search',
    Icon: Search,
  },
  {
    name: 'Chats',
    path: '/chats',
    Icon: ChatDots,
  },
  {
    name: 'Notifications',
    path: '/notifications',
    Icon: Bell,
  },
  {
    name: 'Profile',
    path: '/user/me',
    Icon: Person,
  },
];

function ProfileTooltip() {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear();
    await httpClient.post('/user/logout');
    store.dispatch({ type: 'logout' });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-36 h-12 text-lg rounded-3xl text-red-500 hover:bg-red-50">
      Logout
    </button>
  );
}

export default function MainSidebar() {
  const { data } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await httpClient.get('/user/profile');
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      store.dispatch(setProfile(data));
    }
  }, [data]);

  return (
    <aside className="h-screen border-r flex-1 max-w-[300px] border-r-slate-200 p-4 flex flex-col gap-6 sticky bottom-0 top-0">
      <Logo />
      <div className="w-full flex-1 mt-5">
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.name} className="text-xl">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-5 rounded-3xl ${isActive ? 'bg-slate-100' : ''}`
                }>
                {({ isActive }) => (
                  <>
                    <link.Icon size={28} className={isActive ? 'stroke-[2.5]' : ''} />
                    <span className={isActive ? 'font-bold' : ''}>{link.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <Tooltip
        title={ProfileTooltip}
        trigger="click"
        color="#ffffff"
        overlayInnerStyle={{ borderRadius: 50, padding: '0px' }}>
        <div className="p-3 rounded-3xl hover:bg-slate-100 hover:cursor-pointer">
          <div className="flex items-center gap-3 h-[45px]">
            {data ? (
              <>
                <img
                  src={data.avatar || DefaultProfile}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover block"
                />
                <div className="flex-1 overflow-x-hidden">
                  <h3 className="font-bold">{data.name}</h3>
                  <p className="text-sm text-slate-400">{data.email}</p>
                </div>
              </>
            ) : (
              <>
                <Skeleton.Avatar active size={40} />
                <Skeleton.Input className="flex-1" active />
              </>
            )}
            <div className="w-4">
              <MoreHorizontalFill strokeWidth={3} size={16} />
            </div>
          </div>
        </div>
      </Tooltip>
    </aside>
  );
}
