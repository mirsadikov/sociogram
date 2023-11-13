import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DefaultProfile from '../images/default_profile.png';
import { formatTimeDiff } from '../utils/time-formatter';

export default function Notifications() {
  const notifications = useSelector((state: RootState) => state.globals.notifications);

  return (
    <div className="container mx-auto p-4 px-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      <div className="flex mx-auto flex-col w-full max-w-md py-3">
        {notifications?.map((notification, index) => (
          <div key={index} className="flex items-center mb-4">
            <img
              src={notification.sender.avatar || DefaultProfile}
              className="w-8 h-8 rounded-full mr-4"
            />
            <div>
              <p className="text-sm font-bold">{buildContent(notification)}</p>
              <p className="text-xs text-gray-500">{formatTimeDiff(notification.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const buildContent = (notification: any) => {
  switch (notification.type) {
    case 'follow':
      return `${notification.sender.name} started following you`;
    case 'like':
      return `${notification.sender.name} liked your post`;
    default:
      return '';
  }
};
