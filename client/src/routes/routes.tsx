import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';

import RootLayout from '../layouts/root-layout';
import MainLayout from '../layouts/main-layout';
import AuthLayout from '../layouts/auth-layout';
import ChatLayout from '../layouts/chat-layout';
import Home from '../pages/home';
import Notifications from '../pages/notifications';
import UserProfile from '../pages/user-profile';
const NotFound = React.lazy(() => import('../pages/not-found'));
const SignUp = React.lazy(() => import('../pages/sign-up'));
const SignIn = React.lazy(() => import('../pages/sign-in'));
const SingleChat = React.lazy(() => import('../pages/single-chat'));
const Search = React.lazy(() => import('../pages/search'));

const routes = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/search', element: <Search /> },
          { path: '/notifications', element: <Notifications /> },
        ],
      },
      {
        path: '/user/me',
        element: <UserProfile />,
      },
      {
        path: '/user/:username',
        element: <UserProfile />,
      },
      {
        path: '/chats',
        element: <ChatLayout />,
        children: [
          {
            index: true,
            element: <SingleChat />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '/register', element: <SignUp /> },
      { path: '/login', element: <SignIn /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export default function MyRoutes() {
  return <RouterProvider router={routes} />;
}
