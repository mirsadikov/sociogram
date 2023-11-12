import { Link } from 'react-router-dom';
import DefaultProfile from '../images/default_profile.png';
import { User } from '../types';

type UserRowProps = {
  user: User;
  children?: React.ReactNode;
};

export default function UserRow({ user, children }: UserRowProps) {
  return (
    <>
      <div className="flex items-center gap-3 w-full">
        <img
          src={user?.avatar || DefaultProfile}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover block"
        />
        <div className="flex-1 overflow-x-hidden">
          <Link to={`/user/${user.id}`} className="font-bold hover:underline">
            {user?.name}
          </Link>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
        {children}
      </div>
    </>
  );
}
