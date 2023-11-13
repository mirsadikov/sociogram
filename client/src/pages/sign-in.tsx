import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import httpClient from '../api/httpClient';
import { store } from '../store';
import { login } from '../store/slices/auth-slice';
import { ButtonPrimary } from '../components/buttons';
import { Link } from 'react-router-dom';

export default function SignIn() {
  const register = async (values: any) => {
    const { data } = await httpClient.post('/user/login', values);
    return data;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: register,
    onSuccess: ({ access_token }) => {
      store.dispatch(login(access_token));
    },
  });

  return (
    <>
      <Form
        className="p-6"
        name="login"
        onFinish={mutate}
        validateTrigger={['onBlur']}
        layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            {
              type: 'email',
              message: 'Please enter a valid email!',
            },
          ]}>
          <Input className="rounded-full p-2 px-3" placeholder="email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
            {
              min: 6,
              message: 'Email must be at least 6 characters.',
            },
          ]}>
          <Input.Password className="rounded-full p-2 px-3" placeholder="password" />
        </Form.Item>
        <div className="flex items-center justify-between">
          <Link to="/register" className="text-sm text-slate-600 hover:underline">
            Don't have an account?
          </Link>
          <Form.Item>
            <ButtonPrimary htmlType="submit" className="mt-4 " loading={isPending}>
              Login
            </ButtonPrimary>
          </Form.Item>
        </div>
      </Form>
    </>
  );
}
