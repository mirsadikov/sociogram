import { Button } from 'antd';

type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
};

export function ButtonPrimary({
  onClick,
  className,
  children,
  loading = false,
  htmlType,
}: ButtonProps) {
  return (
    <Button
      htmlType={htmlType}
      loading={loading}
      onClick={onClick}
      type="primary"
      className={`${className} ml-auto block mt-4 hover:!bg-indigo-700 h-[40px] bg-indigo-500 text-white px-5 py-2 rounded-full font-semibold`}>
      {children}
    </Button>
  );
}

export function ButtonSecandary({
  onClick,
  className,
  children,
  loading = false,
  htmlType,
}: ButtonProps) {
  return (
    <Button
      htmlType={htmlType}
      loading={loading}
      onClick={onClick}
      type="default"
      className={`${className}  flex items-center justify-center bg-white text-blue-400 h-[40px] px-5 py-2 rounded-full font-semibold`}>
      {children}
    </Button>
  );
}
