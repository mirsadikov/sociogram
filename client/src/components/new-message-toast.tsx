import { Message, User } from '../types';
import DefaultProfile from '../images/default_profile.png';

type Props = {
  content: string;
  sender: User;
};

export default function NewMessageToast({ content, sender }: Props) {
  return (
    <div
      className={`max-w-xs w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img className="h-10 w-10 rounded-full" src={sender.avatar || DefaultProfile} alt="" />
          </div>
          <div className="ml-3 flex-1 overflow-x-hidden">
            <p className="text-sm font-medium text-gray-900">{sender.name}</p>
            <p className="mt-1 text-sm text-gray-500">{content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
