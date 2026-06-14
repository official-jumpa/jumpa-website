import { useRouter } from 'next/navigation';
const messageIcon = '/assets/icons/actions/message.svg';

const FloatingSupportButton: React.FC = () => {
  const router = useRouter();


  return (
    <button
      className="absolute bottom-[118px] right-6 w-[52px] h-[52px] rounded-[100px] bg-[#F0EEFA] border-none cursor-pointer flex items-center justify-center p-2.5 shadow-[0px_9px_49px_0px_rgba(129,121,255,0.25),6px_4px_49px_0px_rgba(225,222,245,0.25)] z-40 transition-all duration-150 ease-out hover:scale-105 hover:shadow-[0_6px_28px_rgba(0,0,0,0.3)] active:scale-95"
      aria-label="Open chat"
      type="button"
      onClick={() => router.push('/chat')}

    >
      <img src={messageIcon} alt="" width="24" height="24" />
    </button>
  );
};

export default FloatingSupportButton;
