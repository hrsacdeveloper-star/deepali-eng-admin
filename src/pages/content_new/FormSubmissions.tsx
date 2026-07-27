import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Plus, Eye } from 'lucide-react';

const formSchema = z.object({
  type: z.string().optional().nullable(),
  payload: z.string().min(1, 'Required'),
  status: z.string().optional().nullable(),
});

type FormValues = {
  type: string | null | undefined;
  payload: string;
  status: string | null | undefined;
};

export default function FormSubmissions() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      type: '',
      payload: '',
      status: '',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('form_submissions').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      setDataList(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const cleanValues = { ...values } as any;
      Object.keys(cleanValues).forEach(k => {
        if (cleanValues[k] === '') cleanValues[k] = null;
      });

      // Convert payload string to JSON if provided
      if (cleanValues.payload && typeof cleanValues.payload === 'string') {
        try {
          cleanValues.payload = JSON.parse(cleanValues.payload);
        } catch {
          cleanValues.payload = { data: cleanValues.payload };
        }
      }

      if (editingId) {
        const { error } = await supabase.from('form_submissions').update(cleanValues).eq('id', editingId);
        if (error) throw error;
        toast.success('Form Submissions updated successfully');
      } else {
        const { error } = await supabase.from('form_submissions').insert([cleanValues]);
        if (error) throw error;
        toast.success('Form Submissions created successfully');
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from('form_submissions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Item deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setViewOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      type: '',
      payload: '',
      status: '',
    });
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Form Submissions Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Form Submissions</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="payload" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payload</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end pt-4">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Submission Details</DialogTitle>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Type:</label>
                  <p className="text-sm bg-muted p-2 rounded">{viewingItem.type || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Status:</label>
                  <p className="text-sm bg-muted p-2 rounded">{viewingItem.status || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Submitted Data:</label>
                  <div className="bg-muted p-4 rounded space-y-3">
                    {(() => {
                      try {
                        const data = typeof viewingItem.payload === 'string' 
                          ? JSON.parse(viewingItem.payload)
                          : viewingItem.payload;
                        return Object.entries(data || {}).map(([key, value]) => (
                          <div key={key} className="pb-2 border-b last:border-b-0">
                            <p className="font-medium text-xs text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}:
                            </p>
                            <p className="text-sm mt-1 break-words">{String(value)}</p>
                          </div>
                        ));
                      } catch (e) {
                        return <p className="text-sm text-red-600">Could not parse data</p>;
                      }
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Submitted Date:</label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {viewingItem.created_at ? new Date(viewingItem.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : dataList.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center">No data found</TableCell></TableRow>
            ) : (
              dataList.map((item) => {
                const getName = () => {
                  try {
                    const data = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
                    return data?.name || 'N/A';
                  } catch {
                    return 'N/A';
                  }
                };
                return (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs truncate">{item.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{getName()}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(item)} title="View"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
