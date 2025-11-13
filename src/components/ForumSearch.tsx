import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  forum_id: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  username: string;
  avatar_url: string;
  comment_count: number;
}

interface Forum {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function ForumSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedForum, setSelectedForum] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchForums();
    fetchTags();
  }, []);

  const fetchForums = async () => {
    const { data } = await supabase.from('forums').select('id, name');
    setForums(data || []);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('id, name, color');
    setTags(data || []);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.rpc('search_forum_posts', {
        search_query: query,
        forum_filter: selectedForum || null,
        tag_filter: selectedTag || null
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedForum('');
    setSelectedTag('');
    setHasSearched(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Forums
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Select value={selectedForum} onValueChange={setSelectedForum}>
            <SelectTrigger>
              <SelectValue placeholder="All Forums" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Forums</SelectItem>
              {forums.map((forum) => (
                <SelectItem key={forum.id} value={forum.id}>
                  {forum.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger>
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasSearched && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <Link key={result.id} to={`/forums/${result.forum_id}/posts/${result.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-1 hover:text-primary">{result.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {result.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{result.username}</span>
                        <div className="flex items-center gap-2">
                          <span>{result.views} views</span>
                          <span>•</span>
                          <span>{result.comment_count} comments</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
