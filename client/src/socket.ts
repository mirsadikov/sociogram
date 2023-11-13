import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { store } from './store';
import { addNewChat, addNewMessage, setChatMessages, setChats } from './store/slices/chats-slice';
import * as notification from './utils/notification';

const URL = import.meta.env.VITE_SOCKET_URL as string;

const socket = io(URL, {
  autoConnect: false,
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on('exception', (data) => {
  toast.error(typeof data.message === 'string' ? data.message : 'Something went wrong');
});

socket.on('error', (err) => {
  toast.error(err.message || 'Something went wrong');
});

function startListening() {
  socket.on('connect', () => {
    console.log('connected');
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  socket.on('get-chats', (chats) => {
    store.dispatch(setChats(chats));
  });

  socket.on('get-messages', (messages) => {
    store.dispatch(setChatMessages(messages));
  });

  socket.on('new-chat', (chat) => {
    notification.newChat(chat);
    store.dispatch(addNewChat(chat));
  });

  socket.on('new-message', (message) => {
    notification.newMessage(message);
    store.dispatch(addNewMessage(message));
  });
}

function stopListening() {
  socket.off('connect');
  socket.off('get-chats');
  socket.off('get-messages');
  socket.off('new-chat');
  socket.off('new-message');
}

export { socket, startListening, stopListening };
