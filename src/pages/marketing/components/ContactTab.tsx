import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trash2, Eye } from 'lucide-react';

export function ContactTab() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState<any>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('form_submissions').select('*').eq('form_type', 'Contact').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch enquiries');
    else setEnquiries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('form_submissions').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Status updated');
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const { error } = await supabase.from('form_submissions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Enquiry deleted');
      fetchEnquiries();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Contact Enquiries</h3>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Contact Info</TableHead>
              <TableHead className="whitespace-nowrap">Message Snippet</TableHead>
              <TableHead className="whitespace-nowrap text-center">Status</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No enquiries found</TableCell></TableRow>
            ) : (
              enquiries.map(enq => (
                <TableRow key={enq.id}>
                  <TableCell className="whitespace-nowrap">{new Date(enq.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{enq.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{enq.email}</div>
                    <div className="text-xs text-muted-foreground">{enq.phone}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{enq.message}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Select value={enq.status} onValueChange={(val) => updateStatus(enq.id, val)}>
                      <SelectTrigger className={`h-8 w-28 mx-auto ${getStatusColor(enq.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Replied">Replied</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setViewItem(enq)} title="View"><Eye className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(enq.id)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold text-muted-foreground">Name:</span><p>{viewItem.name}</p></div>
                <div><span className="font-semibold text-muted-foreground">Date:</span><p>{new Date(viewItem.created_at).toLocaleString()}</p></div>
                <div><span className="font-semibold text-muted-foreground">Email:</span><p>{viewItem.email}</p></div>
                <div><span className="font-semibold text-muted-foreground">Phone:</span><p>{viewItem.phone || '-'}</p></div>
                <div><span className="font-semibold text-muted-foreground">Company:</span><p>{viewItem.company || '-'}</p></div>
                <div><span className="font-semibold text-muted-foreground">Subject:</span><p>{viewItem.subject || '-'}</p></div>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Message:</span>
                <div className="p-3 mt-1 bg-muted rounded-md whitespace-pre-wrap">{viewItem.message}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
