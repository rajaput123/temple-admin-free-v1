import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect super_admin to platform, others to hub
      if (user?.role === 'super_admin') {
        navigate('/platform');
      } else {
        navigate('/hub');
      }
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

export default Index;
