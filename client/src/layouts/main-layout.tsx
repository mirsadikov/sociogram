import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Loader from '../components/loader';

const FollowsSidebar = React.lazy(() => import('../components/follow-sidebar'));

export default function MainLayout() {
  return (
    <>
      <main className="flex-1 flex">
        <section className="flex-1 sticky top-0 bottom-0">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </section>

        <aside className="border-l flex-1 max-w-[350px] border-l-slate-200">
          <Suspense fallback={<Loader />}>
            <FollowsSidebar />
          </Suspense>
        </aside>
      </main>
    </>
  );
}
