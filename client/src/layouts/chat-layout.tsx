import { Outlet } from 'react-router-dom';
import ChatList from '../components/chat-list';
import { Suspense } from 'react';
import Loader from '../components/loader';

export default function ChatLayout() {
  return (
    <section className="flex-1 flex">
      <section className="flex-1 max-w-[450px]">
        <Suspense fallback={<Loader />}>
          <ChatList />
        </Suspense>
      </section>
      <section className="border-l flex-1 border-l-slate-200">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </section>
    </section>
  );
}
