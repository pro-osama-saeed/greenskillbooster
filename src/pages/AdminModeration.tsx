import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, XCircle, Clock, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Report {
  id: string;
  reporter_id: string;
  reported_type: string;
  reported_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  reporter: {
    username: string;
  };
}

export default function AdminModeration() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    
    const query = supabase
      .from('reports')
      .select(`
        *,
        reporter:reporter_id (username)
      `)
      .order('created_at', { ascending: false });

    if (filterStatus !== 'all') {
      query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load reports');
      return;
    }

    setReports(data || []);
    setLoading(false);
  };

  const handleReport = async (reportId: string, newStatus: string) => {
    if (!user) return;
    
    setProcessingId(reportId);

    const { error } = await supabase
      .from('reports')
      .update({
        status: newStatus,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes[reportId] || null
      })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to update report');
      setProcessingId(null);
      return;
    }

    toast.success(`Report ${newStatus}`);
    setProcessingId(null);
    fetchReports();
  };

  const getContentLink = (report: Report) => {
    switch (report.reported_type) {
      case 'post':
        return `/forums/post/${report.reported_id}`;
      case 'user':
        return `/profile/${report.reported_id}`;
      default:
        return '#';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewing':
        return <Eye className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'reviewing':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'dismissed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Content Moderation</h1>
        <p className="text-muted-foreground">Review and manage reported content</p>
      </div>

      <div className="mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No reports found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(report.status as any)}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status}</span>
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {report.reported_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{report.reason}</CardTitle>
                    <CardDescription>
                      Reported by {report.reporter.username} • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Link to={getContentLink(report)} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Content
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.details && (
                  <div>
                    <p className="text-sm font-medium mb-1">Details:</p>
                    <p className="text-sm text-muted-foreground">{report.details}</p>
                  </div>
                )}

                {report.status === 'pending' && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add resolution notes..."
                      value={resolutionNotes[report.id] || ''}
                      onChange={(e) => setResolutionNotes({ ...resolutionNotes, [report.id]: e.target.value })}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReport(report.id, 'reviewing')}
                        disabled={processingId === report.id}
                        variant="outline"
                      >
                        Mark as Reviewing
                      </Button>
                      <Button
                        onClick={() => handleReport(report.id, 'resolved')}
                        disabled={processingId === report.id}
                      >
                        {processingId === report.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Resolve
                      </Button>
                      <Button
                        onClick={() => handleReport(report.id, 'dismissed')}
                        disabled={processingId === report.id}
                        variant="secondary"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
