import { Spin } from 'antd';

type LoaderProps = {
  className?: string;
  size?: 'small' | 'default' | 'large';
};

export default function Loader({ className = '', size = 'large' }: LoaderProps) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <Spin className={className} size={size} />
    </div>
  );
}
