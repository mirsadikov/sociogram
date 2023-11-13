import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useEffect, useState, useRef } from 'react';
import UserRow from '../components/user-row';
import { ButtonPrimary } from '../components/buttons';
import { socket } from '../socket';
import { formatTime } from '../utils/time-formatter';
import { closeCurrentChat } from '../store/slices/chats-slice';

export default function SingleChat() {
  const chatContainerRef = useRef<any>();
  const [chat, setChat] = useState<any>();
  const [message, setMessage] = useState('');
  const { list, currentChat } = useSelector((state: RootState) => state.chats);
  const profile = useSelector((state: RootState) => state.auth.profile);

  useEffect(() => {
    if (!currentChat || !list) return;

    const existingChat = list.find((chat) => chat.receiver.id === currentChat.receiver_id);

    if (existingChat) {
      setChat({ ...existingChat });
    } else {
      const user = profile?.following?.list?.find((user) => user.id === currentChat.receiver_id);
      setChat({ receiver: user, new: true });
    }

    return () => {
      closeCurrentChat();
    };
  }, [currentChat, list]);

  useEffect(() => {
    if (chat && !chat.messages && !chat.new) {
      socket.emit('get-messages', { receiver_id: chat.receiver.id });
    }
  }, [chat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
      });
    }
  }, [chat?.messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message.length > 0 && chat) {
      if (chat.new) {
        socket.emit('new-chat', {
          receiver_id: chat.receiver.id,
          message,
        });
      } else {
        socket.emit('new-message', { receiver_id: chat.receiver.id, message });
      }
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-r-slate-200 max-h-screen">
      {chat ? (
        <>
          <div className="p-3 px-6">
            <UserRow user={chat.receiver} />
          </div>
          {chat.messages && chat.messages.length > 0 ? (
            <div className="flex-1 overflow-y-auto py-5 px-1 flex flex-col" ref={chatContainerRef}>
              <p className="text-center text-slate-400 text-sm mb-6">Start of the chat</p>
              {chat.messages.map((message: any) => {
                const owner = message.author_id === profile?.id;
                return (
                  <div className={`${owner ? 'text-right' : 'text-left'} m-2`} key={message.id}>
                    <div
                      className={`${
                        owner
                          ? 'bg-indigo-500 rounded-br-md text-white'
                          : 'bg-gray-100 rounded-bl-md text-black'
                      } rounded-3xl px-3.5 py-1.5 inline-block`}>
                      {message.content}
                    </div>
                    <div
                      className={`text-xs tracking-tight text-slate-400 mt-1 ${
                        owner ? 'text-right' : ''
                      }`}>
                      {formatTime(message.created_at, true)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center">No messages</div>
          )}
          <div className="flex p-1.5 px-3 border-t border-t-slate-200">
            <form
              onSubmit={sendMessage}
              className=" w-full flex rounded-xl relative bg-slate-100 p-1.5">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                placeholder="Type a message..."
                className="flex-1 border outline-none border-none px-3 py-1 bg-transparent"
              />
              <ButtonPrimary htmlType="submit">Send</ButtonPrimary>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex justify-center items-center">Select a chat</div>
      )}
    </div>
  );
}
