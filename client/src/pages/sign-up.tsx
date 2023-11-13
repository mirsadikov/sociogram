import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import httpClient from '../api/httpClient';
import { store } from '../store';
import { login } from '../store/slices/auth-slice';
import { Link } from 'react-router-dom';
import { ButtonPrimary } from '../components/buttons';

export default function SignUp() {
  const register = async (values: any) => {
    const { data } = await httpClient.post('/user/register', values);
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
        name="register"
        onFinish={mutate}
        validateTrigger={['onBlur']}
        layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}>
          <Input className="rounded-full p-2 px-3" placeholder="name" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
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
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}>
          <Input.Password className="rounded-full p-2 px-3" placeholder="confirm password" />
        </Form.Item>
        <div className="flex items-center justify-between">
          <Link to="/login" className="text-sm text-slate-600 hover:underline">
            Already have an account?
          </Link>
          <Form.Item>
            <ButtonPrimary htmlType="submit" className="mt-4 " loading={isPending}>
              Register
            </ButtonPrimary>
          </Form.Item>
        </div>
      </Form>
    </>
  );
}
