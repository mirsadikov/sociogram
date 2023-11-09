import { useMutation } from '@tanstack/react-query';
import Feed from './feed';
import httpClient from '../api/httpClient';
import TextArea from 'antd/es/input/TextArea';
import { ButtonPrimary } from '../components/buttons';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const [content, setContent] = useState('');

  const { mutate, isPending } = useMutation({
    mutationKey: ['user_posts'],
    onSuccess() {
      setContent('');
      toast.success('Post created');
    },
    mutationFn: async () => {
      console.log(content);
      const { data } = await httpClient.post('/post/user', { content });

      return data;
    },
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b-slate-200 border-b">
        <h2 className="text-xl font-bold text-center py-3">Feed</h2>
      </div>
      <div className="border-b-slate-200 border-b p-4 px-6">
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          bordered={false}
          className="w-full  text-xl leading-tight"
          placeholder="What is happening?"
          autoSize
        />
        <ButtonPrimary onClick={() => mutate()} loading={isPending}>
          Post
        </ButtonPrimary>
      </div>
      <Feed />
    </div>
  );
}
