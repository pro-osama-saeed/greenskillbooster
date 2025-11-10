import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportButtonProps {
  reportedType: 'post' | 'comment' | 'user' | 'action';
  reportedId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'False information',
  'Inappropriate content',
  'Duplicate content',
  'Other'
];

export default function ReportButton({ reportedType, reportedId, variant = 'ghost', size = 'sm' }: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to report content');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_type: reportedType,
        reported_id: reportedId,
        reason,
        details: details.trim() || null
      });

    if (error) {
      toast.error('Failed to submit report');
      setSubmitting(false);
      return;
    }

    toast.success('Report submitted successfully. Our team will review it.');
    setOpen(false);
    setReason('');
    setDetails('');
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Details (Optional)</label>
            <Textarea
              placeholder="Provide any additional context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="w-full"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
