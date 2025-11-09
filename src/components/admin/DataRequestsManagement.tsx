import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { CheckCircle, Clock, FileText } from 'lucide-react';

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

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export default function DataRequestsManagement() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, teamRes] = await Promise.all([
        supabase
          .from('data_requests')
          .select('*')
          .order('submitted_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, full_name, email')
      ]);

      if (requestsRes.error) throw requestsRes.error;
      if (teamRes.error) throw teamRes.error;

      setRequests(requestsRes.data || []);
      setTeamMembers(teamRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('data_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast({
        title: 'Success',
        description: 'Request status updated',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const assignRequest = async (id: string, assignedTo: string | null) => {
    try {
      const { error } = await supabase
        .from('data_requests')
        .update({ assigned_to: assignedTo })
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      toast({
        title: 'Success',
        description: 'Request assigned',
      });
    } catch (error) {
      console.error('Error assigning request:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign request',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
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
                {requests.map((request) => (
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
        </CardContent>
      </Card>
    </div>
  );
}