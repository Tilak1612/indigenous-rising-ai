import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Search, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  confirmed_at: string | null;
}

const PAGE_SIZE = 50;

export default function NewsletterManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async (searchTerm: string, pageIndex: number) => {
    try {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('newsletter_subscriptions')
        .select('id, email, subscribed_at, is_active, confirmed_at', { count: 'exact' })
        .order('subscribed_at', { ascending: false })
        .range(from, to);

      if (searchTerm.trim()) {
        query = query.ilike('email', `%${searchTerm.trim()}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setSubscriptions(data || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscriptions(search, page);
  }, [fetchSubscriptions, search, page]);

  // Debounce search — avoid a query on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const exportToCSV = async () => {
    // Export all matching rows — separate query without pagination
    try {
      let query = supabase
        .from('newsletter_subscriptions')
        .select('email, subscribed_at, is_active, confirmed_at')
        .order('subscribed_at', { ascending: false });

      if (search.trim()) {
        query = query.ilike('email', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const headers = ['Email', 'Subscribed At', 'Status', 'Confirmed'];
      const rows = (data || []).map(sub => [
        sub.email,
        format(new Date(sub.subscribed_at), 'yyyy-MM-dd HH:mm:ss'),
        sub.is_active ? 'Active' : 'Inactive',
        sub.confirmed_at ? 'Yes' : 'No',
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Success', description: 'Subscribers exported to CSV' });
    } catch {
      toast({ title: 'Error', description: 'Failed to export', variant: 'destructive' });
    }
  };

  const unsubscribe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await fetchSubscriptions(search, page);
      toast({ title: 'Success', description: 'Subscriber unsubscribed' });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({ title: 'Error', description: 'Failed to unsubscribe user', variant: 'destructive' });
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading && subscriptions.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Subscribers (filtered)</CardDescription>
            <CardTitle className="text-3xl">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Page</CardDescription>
            <CardTitle className="text-3xl">{page + 1} / {totalPages || 1}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>Manage newsletter subscriptions</CardDescription>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No subscribers found</TableCell></TableRow>
                ) : subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell>{format(new Date(sub.subscribed_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.confirmed_at ? (
                        <Badge variant="outline">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {sub.is_active && (
                        <Button variant="ghost" size="sm" onClick={() => unsubscribe(sub.id)}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
