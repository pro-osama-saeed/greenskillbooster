import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  hashtags?: string[];
}

export const SocialShare = ({ title, description, url, hashtags = [] }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const hashtagString = hashtags.join(',');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtagString}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
          <DialogDescription>
            Inspire others by sharing your climate action journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(shareLinks.twitter, '_blank')}
            >
              <Twitter className="h-5 w-5 mr-2" />
              Twitter
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(shareLinks.facebook, '_blank')}
            >
              <Facebook className="h-5 w-5 mr-2" />
              Facebook
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(shareLinks.linkedin, '_blank')}
            >
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </Button>

            {navigator.share && (
              <Button
                variant="outline"
                className="w-full"
                onClick={shareNative}
              >
                <Share2 className="h-5 w-5 mr-2" />
                More
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 bg-muted rounded-md text-sm text-muted-foreground truncate">
              {shareUrl}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
