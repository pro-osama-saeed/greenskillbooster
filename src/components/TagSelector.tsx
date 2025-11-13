import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

export default function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Failed to load tags');
      return;
    }

    setTags(data || []);
    setLoading(false);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length >= 3) {
        toast.warning('Maximum 3 tags allowed');
        return;
      }
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTagObjects.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color, color: 'white' }}
            className="cursor-pointer"
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name} ×
          </Badge>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <Plus className="w-4 h-4 mr-1" />
              Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Select up to 3 tags</p>
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <Button
                      key={tag.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTag(tag.id)}
                      className="justify-start gap-2"
                      style={isSelected ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {tag.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedTags.length}/3 tags selected
      </p>
    </div>
  );
}
