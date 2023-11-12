import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import httpClient from '../api/httpClient';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary, ButtonSecandary } from '../components/buttons';
import { useDebounce } from '@uidotdev/usehooks';
import Loader from '../components/loader';
import { setUserSearch } from '../store/slices/globals-slice';
import { store } from '../store';
import UserRow from '../components/user-row';
import toast from 'react-hot-toast';
import { setCurrentChat } from '../store/slices/chats-slice';

export default function Search() {
  const prevSearch = store.getState().globals.user_search;
  const [search, setSearch] = useState(prevSearch);
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ['search', debouncedSearch],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await httpClient.post('/user/search', { search: debouncedSearch });

      store.dispatch(setUserSearch(search));
      return data;
    },
    enabled: debouncedSearch.length > 0,
  });

  const { mutate: follow } = useMutation({
    mutationKey: ['following'],
    mutationFn: async (id: string) => {
      const { data } = await httpClient.post(`/follow`, { id });

      return data;
    },
    onSuccess(data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['following'] });
      // manually update the cache
      queryClient.setQueryData(['search', debouncedSearch], (prev: any) => {
        return {
          ...prev,
          users: prev.users.map((user: any) =>
            user.id === data.id ? { ...user, is_following: true } : user
          ),
        };
      });
    },
  });

  const prevent = (e: React.MouseEvent<HTMLElement>, func: any) => {
    e.stopPropagation();
    e.preventDefault();

    func();
  };

  const handleNavigate = (id: string) => {
    store.dispatch(setCurrentChat({ receiver_id: id }));
    navigate(`/chats`);
  };

  return (
    <div>
      <div className="p-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(() => e.target.value)}
            placeholder="Search for users"
            className="border-none bg-slate-100 rounded-full px-4 py-3 w-full outline-none"
          />
          {isFetching && (
            <Loader className="absolute right-5 top-1/2 -translate-y-1/2" size="default" />
          )}
        </div>
      </div>
      <div className="w-full">
        {!data && (
          <div className="text-xl flex justify-center items-center h-[200px]">
            Search your friend
          </div>
        )}

        {data && data.users.length === 0 && (
          <div className="ext-xl flex justify-center items-center h-[200px]">No users found</div>
        )}

        {data && data.users.length > 0 && (
          <ul className="w-full">
            {data.users.map((user: any) => (
              <li key={user.id} className="hover:bg-slate-100">
                <div
                  onClick={() => navigate(`/user/${user.id}`)}
                  className="block p-4 px-10 cursor-pointer">
                  <UserRow user={user}>
                    {user.is_following ? (
                      <ButtonSecandary
                        onClick={(e) => prevent(e, () => handleNavigate(user.id))}
                        className="">
                        Message
                      </ButtonSecandary>
                    ) : (
                      <ButtonPrimary onClick={(e) => prevent(e, () => follow(user.id))}>
                        Follow
                      </ButtonPrimary>
                    )}
                  </UserRow>
                  <div className="pl-12 pt-1">
                    <p className="pl-1">{user.bio}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
