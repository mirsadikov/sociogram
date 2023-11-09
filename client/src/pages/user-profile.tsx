import { Suspense } from 'react';
import Loader from '../components/loader';

export default function UserProfile() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="flex-1">Profile Page</div>
    </Suspense>
  );
}
