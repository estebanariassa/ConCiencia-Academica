import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaCog, 
  FaChevronDown,
  FaUser,
  FaLock,
  FaEnvelope
} from 'react-icons/fa';

interface IconProps {
  name: string;
  className?: string;
}

export default function Icon({ name, className = '' }: IconProps) {
  const icons: { [key: string]: JSX.Element } = {
    graduation: <FaGraduationCap className={className} />,
    teacher: <FaChalkboardTeacher className={className} />,
    cog: <FaCog className={className} />,
    chevronDown: <FaChevronDown className={className} />,
    user: <FaUser className={className} />,
    lock: <FaLock className={className} />,
    envelope: <FaEnvelope className={className} />,
  };

  return icons[name] || <FaUser className={className} />;
}