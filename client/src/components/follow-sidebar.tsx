import { useQuery } from '@tanstack/react-query';
import httpClient from '../api/httpClient';
import Loader from './loader';
import { ButtonSecandary } from './buttons';
import { ChatBubble } from 'akar-icons';
import { useNavigate } from 'react-router-dom';
import UserRow from './user-row';

export default function FollowsSidebar() {
  const navigate = useNavigate();
  const { data, isFetching } = useQuery({
    queryKey: ['following'],
    queryFn: async () => {
      const { data } = await httpClient.get('/user/following');

      return data;
    },
  });

  const prevent = (e: React.MouseEvent<HTMLElement>, func: any) => {
    e.stopPropagation();
    e.preventDefault();

    func();
  };

  return (
    <div className="p-6 sticky top-0">
      <h3 className="text-xl pl-2 font-bold">Following list</h3>
      <div className="py-4 w-full">
        {isFetching && (
          <div className="h-72 flex justify-center items-center">
            <Loader />
          </div>
        )}
        <ul>
          {data?.following.map((user: any) => (
            <li key={user.id} className="hover:bg-slate-100 rounded-full">
              <div
                className="p-3 cursor-pointer"
                onClick={(e) => prevent(e, () => navigate(`/user/${user.id}`))}>
                <UserRow user={user}>
                  <ButtonSecandary
                    onClick={(e) => prevent(e, () => navigate(`/chats/${user.id}`))}
                    className="bg-white text-black h-10 w-10 px-0 py-0">
                    <ChatBubble strokeWidth={3} size={18} />
                  </ButtonSecandary>
                </UserRow>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
