import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional(),
  location: z.string().optional(),
  job_type: z.string().optional(),
  experience: z.string().optional(),
  salary_range: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  deadline: z.string().optional(),
  is_active: z.boolean(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export function JobsTab() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: { 
      title: '', department: '', location: '', job_type: 'Full-time', experience: '', salary_range: '',
      description: '', responsibilities: '', requirements: '', deadline: '', is_active: true
    },
  });

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('careers').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch jobs');
    else setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onSubmit = async (data: JobFormValues) => {
    try {
      const payload = { ...data, deadline: data.deadline || null };
      if (editingId) {
        const { error } = await supabase.from('careers').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Job updated');
      } else {
        const { error } = await supabase.from('careers').insert([payload]);
        if (error) throw error;
        toast.success('Job added');
      }
      setOpen(false);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const { error } = await supabase.from('careers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Job deleted');
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (job: any) => {
    setEditingId(job.id);
    form.reset({ 
      title: job.title, department: job.department || '', location: job.location || '', job_type: job.job_type || '',
      experience: job.experience || '', salary_range: job.salary_range || '', description: job.description || '',
      responsibilities: job.responsibilities || '', requirements: job.requirements || '', 
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '', is_active: job.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', department: '', location: '', job_type: 'Full-time', experience: '', salary_range: '', description: '', responsibilities: '', requirements: '', deadline: '', is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Job Openings</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Job Opening</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Job Opening' : 'Add New Job Opening'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Job Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="job_type" render={({ field }) => (
                    <FormItem><FormLabel>Job Type (e.g. Full-time)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem><FormLabel>Experience Required</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="salary_range" render={({ field }) => (
                    <FormItem><FormLabel>Salary Range</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="responsibilities" render={({ field }) => (
                  <FormItem><FormLabel>Responsibilities</FormLabel><FormControl><RichTextEditor value={field.value || ''} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="requirements" render={({ field }) => (
                  <FormItem><FormLabel>Requirements</FormLabel><FormControl><RichTextEditor value={field.value || ''} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem><FormLabel>Application Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Active Status</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Save Job</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Department</TableHead>
              <TableHead className="whitespace-nowrap">Location</TableHead>
              <TableHead className="whitespace-nowrap">Deadline</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : jobs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No jobs found</TableCell></TableRow>
            ) : (
              jobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium whitespace-nowrap">{job.title}</TableCell>
                  <TableCell className="whitespace-nowrap">{job.department || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{job.location || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{job.deadline ? new Date(job.deadline).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-center">{job.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(job)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
