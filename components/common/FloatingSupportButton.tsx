import { useRouter } from 'next/navigation';
import './FloatingSupportButton.css';
const messageIcon = '/assets/icons/actions/message.svg';

const FloatingSupportButton: React.FC = () => {
  const router = useRouter();


  return (
    <button
      className="fab-support"
      aria-label="Open chat"
      type="button"
      onClick={() => router.push('/chat')}

    >
      <img src={messageIcon} alt="" width="24" height="24" />
    </button>
  );
};

export default FloatingSupportButton;
