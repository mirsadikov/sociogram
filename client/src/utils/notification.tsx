import { Chat, NewMessageRes } from '../types';
import NewMessageToast from '../components/new-message-toast';
import toast from 'react-hot-toast';
import { getProfile } from '../store/slices/auth-slice';
import { store } from '../store';

export function newChat(chat: Chat) {
  const userId = getProfile(store.getState())?.id;
  const currentChat = store.getState().chats.currentChat;
  if (currentChat?.open && currentChat?.receiver_id === chat.receiver.id) return;

  if (userId !== chat.receiver.id) {
    toast.custom(
      () =>
        NewMessageToast({
          message: chat.last_message,
          sender: chat.receiver,
        }),
      {
        id: chat.receiver.id,
        position: 'top-right',
        duration: 5000,
      }
    );
  }
}

export function newMessage({ message, sender, owner }: NewMessageRes) {
  if (owner) return;
  const currentChat = store.getState().chats.currentChat;
  if (currentChat?.open && currentChat?.receiver_id === sender.id) return;

  toast.custom(() => NewMessageToast({ message, sender }), {
    id: sender.id,
    position: 'top-right',
    duration: 5000,
  });
}
