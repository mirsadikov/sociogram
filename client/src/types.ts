type Post = {
  author: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  author_id: string;
  content: string;
  created_at: string;
  id: string;
  like_count: number;
  liked: boolean;
};

export type { Post };
