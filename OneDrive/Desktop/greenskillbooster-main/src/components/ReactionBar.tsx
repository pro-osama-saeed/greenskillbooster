import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  parentType: 'forum_post' | 'climate_action' | 'comment';
  parentId: string;
  size?: 'sm' | 'md';
}

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
];

export default function ReactionBar({ parentType, parentId, size = 'md' }: ReactionBarProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [parentId]);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('reaction_type, user_id')
      .eq('parent_type', parentType)
      .eq('parent_id', parentId);

    if (error) return;

    const counts: Record<string, number> = {};
    data.forEach((reaction) => {
      counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
      if (user && reaction.user_id === user.id) {
        setUserReaction(reaction.reaction_type);
      }
    });

    setReactions(counts);
  };

  const toggleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error('Please sign in to react');
      return;
    }

    if (userReaction === reactionType) {
      // Remove reaction
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('parent_type', parentType)
        .eq('parent_id', parentId);

      if (!error) {
        setUserReaction(null);
        setReactions((prev) => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1)
        }));
      }
    } else {
      // Add or update reaction
      const { error } = await supabase
        .from('reactions')
        .upsert({
          user_id: user.id,
          parent_type: parentType,
          parent_id: parentId,
          reaction_type: reactionType
        }, {
          onConflict: 'user_id,parent_type,parent_id'
        });

      if (!error) {
        setReactions((prev) => {
          const updated = { ...prev };
          if (userReaction) {
            updated[userReaction] = Math.max(0, (updated[userReaction] || 0) - 1);
          }
          updated[reactionType] = (updated[reactionType] || 0) + 1;
          return updated;
        });
        setUserReaction(reactionType);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map((reaction) => (
        <Button
          key={reaction.type}
          variant={userReaction === reaction.type ? 'default' : 'outline'}
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={() => toggleReaction(reaction.type)}
          className={cn(
            'gap-1',
            size === 'sm' && 'h-7 text-xs'
          )}
        >
          <span className={size === 'sm' ? 'text-sm' : 'text-base'}>{reaction.emoji}</span>
          {reactions[reaction.type] ? (
            <span className="font-medium">{reactions[reaction.type]}</span>
          ) : null}
        </Button>
      ))}
    </div>
  );
}
