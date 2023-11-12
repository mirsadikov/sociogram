import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState, store } from '../store';
import { socket } from '../socket';
import { setCurrentChat } from '../store/slices/chats-slice';
import DefaultProfile from '../images/default_profile.png';
import { formatTime } from '../utils/time-formatter';
import Loader from './loader';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export default function ChatList() {
  const [animationParent] = useAutoAnimate();
  const chats = useSelector((state: RootState) => state.chats.list);
  const currentChat = useSelector((state: RootState) => state.chats.currentChat);

  useEffect(() => {
    if (!chats) {
      socket.emit('get-chats');
    }
  }, [chats]);

  return (
    <div className="flex max-h-screen flex-col h-full">
      <div className="text-xl font-bold px-5 py-3 border-b border-b-slate-200">My chats</div>
      <div className="flex-1">
        {chats ? (
          chats.length > 0 ? (
            <div className="flex flex-col overflow-y-auto h-full" ref={animationParent}>
              {[...chats]
                .sort(
                  (a, b) =>
                    new Date(b.last_message.created_at).getTime() -
                    new Date(a.last_message.created_at).getTime()
                )
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() =>
                      store.dispatch(setCurrentChat({ receiver_id: chat.receiver.id }))
                    }
                    className={`select-none px-5 py-3 border-b border-b-slate-200 cursor-pointer ${
                      currentChat?.receiver_id === chat.receiver.id ? 'bg-slate-100' : ''
                    }`}>
                    <div className="flex items-center gap-3 w-full">
                      <img
                        src={chat.receiver.avatar || DefaultProfile}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover block"
                      />
                      <div className="flex-1 overflow-x-hidden">
                        <div className="flex items-baseline">
                          <h3 className="font-semibold flex-1">{chat.receiver.name}</h3>
                          <span className="text-sm text-slate-400 tracking-tight">
                            {formatTime(chat.last_message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{chat.last_message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <p>No chats</p>
            </div>
          )
        ) : (
          <div className="flex flex-col justify-center items-center h-full">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
