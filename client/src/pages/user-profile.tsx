import { Suspense, useEffect, useState } from 'react';
import Loader from '../components/loader';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useSelector } from 'react-redux';
import { RootState, store } from '../store';
import httpClient from '../api/httpClient';
import DefaultProfile from '../images/default_profile.png';
import { formatTime } from '../utils/time-formatter';
import { Post, User } from '../types';
import UserRow from '../components/user-row';
import { ButtonPrimary, ButtonSecandary } from '../components/buttons';
import { setCurrentChat } from '../store/slices/chats-slice';
import toast from 'react-hot-toast';

function PostsTab({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col items-center">
      {posts?.length > 0 &&
        posts?.map((post) => (
          <div
            key={post.id}
            className="flex flex-col border border-gray-300 rounded-md w-96 p-4 mb-4">
            <h1 className="text-lg whitespace-pre-wrap">{post.content}</h1>
            <p className="text-gray-500">Posted {formatTime(post.created_at)}</p>
          </div>
        ))}

      {posts?.length === 0 && (
        <div className="flex flex-col items-center mt-3">
          <h1 className="text-2xl font-bold">No Posts</h1>
          <p className="text-gray-500">This user has no posts yet.</p>
        </div>
      )}
    </div>
  );
}

function FollowersTab({ followers }: { followers: User[] }) {
  const navigate = useNavigate();

  return (
    <ul className="flex flex-col items-center">
      {followers?.length > 0 &&
        followers?.map((follower) => (
          <li key={follower.id} className="hover:bg-slate-100 w-96">
            <div
              onClick={() => navigate(`/user/${follower.id}`)}
              className="block p-4 px-10 cursor-pointer">
              <UserRow key={follower.id} user={follower} />
            </div>
          </li>
        ))}

      {followers?.length === 0 && (
        <div className="flex flex-col items-center mt-3">
          <h1 className="text-2xl font-bold">No Followers</h1>
          <p className="text-gray-500">This user has no followers yet.</p>
        </div>
      )}
    </ul>
  );
}

function FollowingTab({ following }: { following: User[] }) {
  const navigate = useNavigate();

  return (
    <ul className="flex flex-col items-center">
      {following?.length > 0 &&
        following?.map((followee) => (
          <li key={followee.id} className="hover:bg-slate-100 w-96">
            <div
              onClick={() => navigate(`/user/${followee.id}`)}
              className="block p-4 px-10 cursor-pointer">
              <UserRow key={followee.id} user={followee} />
            </div>
          </li>
        ))}

      {following?.length === 0 && (
        <div className="flex flex-col items-center mt-3">
          <h1 className="text-2xl font-bold">Not Following Anyone</h1>
          <p className="text-gray-500">This user is not following anyone yet.</p>
        </div>
      )}
    </ul>
  );
}

export default function UserProfile() {
  const { userid = 'me' } = useParams();
  const myProfile = useSelector((state: RootState) => state.auth.profile);
  const [isFollowing, setIsFollowing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['user', userid],
    queryFn: async () => {
      const { data } = await httpClient.get(
        userid === 'me' ? '/user/profile' : `/user/one?id=${userid}`
      );

      return data;
    },
    enabled: !!userid,
  });

  useEffect(() => {
    if (userid === 'me') return;

    if (myProfile?.following?.list && myProfile?.following?.list.length > 0) {
      const isFollowing = myProfile?.following?.list?.some((user: User) => user.id === data?.id);
      setIsFollowing(isFollowing);
    }
  }, [data, myProfile]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Posts',
      children: <PostsTab posts={data?.posts} />,
    },
    {
      key: '2',
      label: 'Followers',
      children: <FollowersTab followers={data?.followers.list} />,
    },
    {
      key: '3',
      label: 'Following',
      children: <FollowingTab following={data?.following.list} />,
    },
  ];

  const { mutate: toggleFollow } = useMutation({
    mutationKey: ['following'],
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: boolean }) => {
      const { data } = newStatus
        ? await httpClient.post(`/follow`, { id })
        : await httpClient.delete(`/follow?id=${id}`);

      return data;
    },
    onSuccess(data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      setIsFollowing((prev) => !prev);
    },
  });

  const handleNavigate = (id: string) => {
    store.dispatch(setCurrentChat({ receiver_id: id }));
    navigate(`/chats`);
  };

  return (
    <Suspense fallback={<Loader />}>
      {isLoading && isFetching ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="flex-1 flex items-center flex-col p-6 w-full">
          <div className="flex  items-center justify-around w-[450px] pb-8">
            <img
              src={data?.avatar || DefaultProfile}
              alt="avatar"
              className="rounded-full w-32 h-32"
            />
            <div className="mt-4 flex flex-col items-center">
              <h1 className="text-2xl font-bold">{data?.name}</h1>
              <p className="text-gray-500">{data?.email}</p>
              <p className="text-gray-500">Joined {formatTime(data?.created_at)}</p>
              <p className="text-gray-600 whitespace-pre-wrap">{data?.bio}</p>
              {/* if not me, show follow, unfollow */}
              {data?.id !== myProfile?.id && (
                <div className="flex mt-4">
                  {isFollowing ? (
                    <>
                      <ButtonSecandary
                        onClick={() => toggleFollow({ id: data?.id, newStatus: false })}>
                        Unfollow
                      </ButtonSecandary>
                      <ButtonSecandary className="ml-2" onClick={() => handleNavigate(data?.id)}>
                        Message
                      </ButtonSecandary>
                    </>
                  ) : (
                    <ButtonPrimary onClick={() => toggleFollow({ id: data?.id, newStatus: true })}>
                      Follow
                    </ButtonPrimary>
                  )}
                </div>
              )}
            </div>
          </div>
          <Tabs className="w-full" defaultActiveKey="1" items={items} centered />
        </div>
      )}
    </Suspense>
  );
}
