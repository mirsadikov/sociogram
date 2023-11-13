import Loader from './loader';
import { ButtonSecandary } from './buttons';
import { ChatBubble } from 'akar-icons';
import { useNavigate } from 'react-router-dom';
import UserRow from './user-row';
import { RootState, store } from '../store';
import { setCurrentChat } from '../store/slices/chats-slice';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useSelector } from 'react-redux';

export default function FollowsSidebar() {
  const [animationParent] = useAutoAnimate();
  const navigate = useNavigate();
  const following = useSelector((state: RootState) => state.auth.profile?.following?.list);

  const prevent = (e: React.MouseEvent<HTMLElement>, func: any) => {
    e.stopPropagation();
    e.preventDefault();

    func();
  };

  const handleChatNavigation = (user: any) => {
    store.dispatch(setCurrentChat({ receiver_id: user.id }));
    navigate(`/chats`);
  };

  return (
    <div className="p-6 sticky top-0">
      <h3 className="text-xl pl-2 font-bold">Following list</h3>
      <div className="py-4 w-full">
        {!following ? (
          <div className="h-72 flex justify-center items-center">
            <Loader />
          </div>
        ) : following && following.length ? (
          <ul ref={animationParent}>
            {following?.map((user: any) => (
              <li key={user.id} className="hover:bg-slate-100 rounded-full">
                <div
                  className="p-3 cursor-pointer"
                  onClick={(e) => prevent(e, () => navigate(`/user/${user.id}`))}>
                  <UserRow user={user}>
                    <ButtonSecandary
                      onClick={(e) => prevent(e, () => handleChatNavigation(user))}
                      className="bg-white !text-black hover:!text-blue-500 h-10 w-10 !p-0">
                      <ChatBubble strokeWidth={3} size={18} />
                    </ButtonSecandary>
                  </UserRow>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-md flex justify-center items-center h-72">Not following anyone</div>
        )}
      </div>
    </div>
  );
}
