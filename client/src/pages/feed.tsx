import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import httpClient from '../api/httpClient';
import Loader from '../components/loader';
import SinglePost from '../components/single-post';
import { Button } from 'antd';
import { Post } from '../types';

export default function Feed() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await httpClient.get('/post/feed');

      return data;
    },
  });

  const { mutate } = useMutation({
    mutationKey: ['post_like'],
    mutationFn: async (post: Post) => {
      if (post.liked) {
        const { data } = await httpClient.post(`/post/unlike`, { id: post.id });
        return data;
      }

      const { data } = await httpClient.post(`/post/like`, { id: post.id });
      return data;
    },
    onSuccess(_, post) {
      queryClient.setQueryData(['feed'], (prev: any) => {
        return {
          ...prev,
          posts: prev.posts.map((p: Post) => {
            if (p.id === post.id) {
              return {
                ...p,
                liked: !p.liked,
                like_count: p.liked ? p.like_count - 1 : p.like_count + 1,
              };
            }

            return p;
          }),
        };
      });
    },
  });

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="border-b border-slate-200 hover:!bg-slate-50 cursor-pointer">
        <Button
          type="link"
          loading={isFetching && !isLoading}
          className="mx-auto block w-full p-2 h-10"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['feed'] })}>
          Refresh
        </Button>
      </div>

      {isFetching && !data && (
        <div className="flex-1 flex justify-center items-center">
          <Loader />
        </div>
      )}

      {data && data.posts.length === 0 && (
        <div className="flex-1 flex justify-center items-center">
          <p className="text-xl font-semibold">No posts found</p>
        </div>
      )}

      {data && (
        <>
          {data?.posts.map((post: Post) => (
            <SinglePost key={post.id} post={post} toggleLike={() => mutate(post)} />
          ))}
        </>
      )}
    </div>
  );
}
