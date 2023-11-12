import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message, NewMessageRes } from '../../types';

type CurrentChat = { receiver_id: string; open?: boolean };

type ChatsState = {
  list: Chat[] | null;
  currentChat: CurrentChat | null;
};

type GetMessagesRes = {
  receiver_id: string;
  messages: Message[];
};

const initialState: ChatsState = {
  list: null,
  currentChat: null,
};

export const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.list = action.payload;
    },

    addNewChat: (state, action: PayloadAction<Chat>) => {
      if (!state.list) return;
      state.list.push(action.payload);
    },

    setCurrentChat: (state, action: PayloadAction<CurrentChat>) => {
      state.currentChat = { receiver_id: action.payload.receiver_id, open: true };
    },

    closeCurrentChat: (state) => {
      state.currentChat!.open = false;
    },

    setChatMessages: (state, action: PayloadAction<GetMessagesRes>) => {
      const { receiver_id, messages } = action.payload;

      state.list = state.list!.map((chat) => {
        if (chat.receiver.id === receiver_id) {
          return { ...chat, messages };
        }

        return chat;
      });

      console.log(state.list);
    },

    addNewMessage: (state, action: PayloadAction<NewMessageRes>) => {
      const { message } = action.payload;

      if (!state.list) return;
      state.list = state.list.map((chat) => {
        if (chat.id === message.chat_id) {
          chat.messages?.length > 0 && chat.messages.push(message);
          chat.last_message = message;
          return chat;
        }

        return chat;
      });
    },
  },
  extraReducers(builder) {
    builder.addCase('logout', (state) => {
      state.list = null;
      state.currentChat = null;
    });
  },
});

export const {
  setChats,
  addNewChat,
  setCurrentChat,
  closeCurrentChat,
  setChatMessages,
  addNewMessage,
} = chatsSlice.actions;

export default chatsSlice.reducer;
