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

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  followers?: {
    list: User[];
  };
  following?: {
    list: User[];
  };
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  chat_id: string;
};

type Chat = {
  id: string;
  created_at: string;
  last_message: Message;
  receiver: User;
  messages: Message[];
};

type NewMessageRes = {
  owner?: boolean;
  message: Message;
  sender: User;
};

export type { Post, User, Message, Chat, NewMessageRes };
