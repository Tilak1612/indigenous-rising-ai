import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataRequest {
  id: string;
  tracking_number: string;
  full_name: string;
  email: string;
  request_type: string;
  status: string;
  submitted_at: string;
  description: string | null;
  assigned_to: string | null;
}

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
}

const PAGE_SIZE = 50;

export default function DataRequestsManagement() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const fetchData = useCallback(async (pageIndex: number) => {
    try {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [requestsRes, teamRes] = await Promise.all([
        supabase
          .from('data_requests')
          .select('id, tracking_number, full_name, email, request_type, status, submitted_at, description, assigned_to', { count: 'exact' })
          .order('submitted_at', { ascending: false })
          .range(from, to),
        // Only fetch profiles of users with admin or team_member roles — not all users
        supabase
          .from('user_roles')
          .select('user_id, profiles:user_id(id, full_name, email)')
          .in('role', ['admin', 'team_member']),
      ]);

      if (requestsRes.error) throw requestsRes.error;
      if (teamRes.error) throw teamRes.error;

      setRequests(requestsRes.data || []);
      setTotalCount(requestsRes.count ?? 0);

      // Flatten the join result into a TeamMember list
      const members: TeamMember[] = (teamRes.data || [])
        .map((row: any) => row.profiles)
        .filter(Boolean)
        .reduce((acc: TeamMember[], p: TeamMember) => {
          if (!acc.find(m => m.id === p.id)) acc.push(p);
          return acc;
        }, []);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('data_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchData(page);
      toast({ title: 'Success', description: 'Request status updated' });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const assignRequest = async (id: string, assignedTo: string | null) => {
    try {
      const { error } = await supabase
        .from('data_requests')
        .update({ assigned_to: assignedTo })
        .eq('id', id);

      if (error) throw error;

      await fetchData(page);
      toast({ title: 'Success', description: 'Request assigned' });
    } catch (error) {
      console.error('Error assigning request:', error);
      toast({ title: 'Error', description: 'Failed to assign request', variant: 'destructive' });
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && requests.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending (this page)</CardDescription>
            <CardTitle className="text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed (this page)</CardDescription>
            <CardTitle className="text-3xl">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Requests</CardTitle>
          <CardDescription>Manage PIPEDA data access requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : requests.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No requests found</TableCell></TableRow>
                ) : requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.tracking_number}</TableCell>
                    <TableCell>{request.full_name}</TableCell>
                    <TableCell className="capitalize">{request.request_type.replace('_', ' ')}</TableCell>
                    <TableCell>{format(new Date(request.submitted_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={request.assigned_to || 'unassigned'}
                        onValueChange={(value) => assignRequest(request.id, value === 'unassigned' ? null : value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name || member.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                            <FileText className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Tracking Number</Label>
                                <p className="font-mono text-sm">{request.tracking_number}</p>
                              </div>
                              <div>
                                <Label>Type</Label>
                                <p className="capitalize">{request.request_type.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <Label>Name</Label>
                                <p>{request.full_name}</p>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <p>{request.email}</p>
                              </div>
                            </div>
                            {request.description && (
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm text-muted-foreground">{request.description}</p>
                              </div>
                            )}
                            <div>
                              <Label>Update Status</Label>
                              <Select
                                value={request.status}
                                onValueChange={(value) => updateStatus(request.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
