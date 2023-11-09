import { Link } from 'react-router-dom';
import DefaultProfile from '../images/default_profile.png';
import { formatTime } from '../utils/time-formatter';
import { Button } from 'antd';
import { HeartFilled, HeartTwoTone } from '@ant-design/icons';
import { Post } from '../types';

type PostProps = {
  post: Post;
  toggleLike: (e: React.MouseEvent<HTMLElement>) => void;
};

export default function SinglePost({ post, toggleLike }: PostProps) {
  return (
    <div className="flex items-start border-b border-slate-200 py-4 px-6">
      <Link to={`/user/${post.author_id}`} className="flex-shrink-0">
        <img className="h-10 w-10 rounded-full" src={post.author.avatar || DefaultProfile} />
      </Link>
      <div className="ml-3 flex-1">
        <div className="flex items-center">
          <Link to={`/user/${post.author_id}`} className="font-semibold text-lg hover:!underline">
            {post.author.name}
          </Link>
          <div className="text-gray-500 ml-2">
            <span>{post.author.email}</span>
            <span className="mx-2 text-gray-500">·</span>
            <span>{formatTime(post.created_at)}</span>
          </div>
        </div>
        <div className="mt-2 text-gray-700 whitespace-pre-wrap">{post.content}</div>
        <div className="mt-2 flex items-center justify-end">
          <span className="font-semibold text-gray-700">{post.like_count}</span>
          <Button
            onClick={toggleLike}
            type="text"
            className="ml-2 p-0 rounded-full text-xl pt-0.5 h-10 w-10 flex items-center justify-center group !text-pink-600">
            {post.liked ? (
              <HeartFilled className="block transition-transform group-hover:scale-110" />
            ) : (
              <HeartTwoTone
                twoToneColor="#EC4899"
                className="block transition-transform group-hover:scale-110"
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
