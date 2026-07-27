import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ApplicationsTab() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('job_applications').select('*, careers(title)').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch applications');
    else setApps(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('job_applications').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Status updated');
      setApps(apps.map(a => a.id === id ? { ...a, status } : a));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      const { error } = await supabase.from('job_applications').delete().eq('id', id);
      if (error) throw error;
      toast.success('Application deleted');
      fetchApps();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Job Applications</h3>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Applicant</TableHead>
              <TableHead className="whitespace-nowrap">Job Position</TableHead>
              <TableHead className="whitespace-nowrap">Contact</TableHead>
              <TableHead className="whitespace-nowrap text-center">Status</TableHead>
              <TableHead className="whitespace-nowrap text-center">Resume</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : apps.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No applications found</TableCell></TableRow>
            ) : (
              apps.map(app => (
                <TableRow key={app.id}>
                  <TableCell className="whitespace-nowrap">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{app.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{app.careers?.title || 'Unknown Job'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{app.email}</div>
                    <div className="text-xs text-muted-foreground">{app.phone}</div>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Select value={app.status} onValueChange={(val) => updateStatus(app.id, val)}>
                      <SelectTrigger className={`h-8 w-32 mx-auto ${getStatusColor(app.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Reviewed">Reviewed</SelectItem>
                        <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {app.resume_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={app.resume_url} target="_blank" rel="noreferrer"><Download className="w-4 h-4 mr-2" /> Resume</a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">No resume</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
