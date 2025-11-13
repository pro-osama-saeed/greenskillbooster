import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const TrackActionButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/track-action');
    }
  };

  return (
    <Button 
      onClick={handleClick}
      size="lg"
      className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
    >
      <Plus className="w-5 h-5" />
      Track My Action
    </Button>
  );
};
