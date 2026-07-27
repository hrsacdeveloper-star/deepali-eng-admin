import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category_id: z.string().optional().nullable(),
  author_name: z.string().optional(),
  featured_image: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published_at: z.string().optional(),
  status: z.enum(['Draft', 'Published']),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [tagsInput, setTagsInput] = useState('');

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: { 
      title: '', slug: '', category_id: null, author_name: '', featured_image: '', 
      excerpt: '', content: '', tags: [], published_at: new Date().toISOString().split('T')[0],
      status: 'Draft', seo_title: '', seo_description: ''
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        supabase.from('articles').select('*, blog_categories(name)').order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('name')
      ]);
      setBlogs(bRes.data || []);
      setCategories(cRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: BlogFormValues) => {
    try {
      const payload = {
        ...data,
        category_id: data.category_id === 'none' ? null : data.category_id,
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingId) {
        const { error } = await supabase.from('articles').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Article updated');
      } else {
        const { error } = await supabase.from('articles').insert([payload]);
        if (error) throw error;
        toast.success('Article created');
      }
      setOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Article deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (blog: any) => {
    setEditingId(blog.id);
    setTagsInput((blog.tags || []).join(', '));
    form.reset({ 
      title: blog.title, 
      slug: blog.slug, 
      category_id: blog.category_id || 'none',
      author_name: blog.author_name || '',
      featured_image: blog.featured_image || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      published_at: blog.published_at ? new Date(blog.published_at).toISOString().split('T')[0] : '',
      status: blog.status,
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || ''
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setTagsInput('');
    form.reset({ 
      title: '', slug: '', category_id: 'none', author_name: '', featured_image: '', 
      excerpt: '', content: '', published_at: new Date().toISOString().split('T')[0],
      status: 'Draft', seo_title: '', seo_description: ''
    });
    setOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const val = e.target.value;
    onChange(val);
    if (!editingId) {
      form.setValue('slug', val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blogs & Articles</h2>
          <p className="text-muted-foreground">Manage news and blog posts.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Write Article</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Article' : 'Write New Article'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} onChange={e => handleTitleChange(e, field.onChange)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="category_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Uncategorized</SelectItem>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="author_name" render={({ field }) => (
                    <FormItem><FormLabel>Author Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="published_at" render={({ field }) => (
                    <FormItem><FormLabel>Publish Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="featured_image" render={({ field }) => (
                  <FormItem><FormLabel>Featured Image</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem><FormLabel>Excerpt / Summary</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem><FormLabel>Content</FormLabel><FormControl><RichTextEditor value={field.value || ''} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl><Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. Industry, News, Updates" /></FormControl>
                  </FormItem>
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-sm">SEO Settings (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="seo_title" render={({ field }) => (
                      <FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="seo_description" render={({ field }) => (
                      <FormItem><FormLabel>SEO Description</FormLabel><FormControl><Textarea rows={1} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>

                <Button type="submit" className="w-full">Save Article</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap text-center">Status</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : blogs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No articles found</TableCell></TableRow>
            ) : (
              blogs.map(blog => (
                <TableRow key={blog.id}>
                  <TableCell className="whitespace-nowrap">
                    {blog.featured_image ? (
                      <img src={blog.featured_image} alt={blog.title} className="w-12 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap max-w-[300px] truncate">{blog.title}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{blog.blog_categories?.name || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge variant={blog.status === 'Published' ? 'default' : 'secondary'}>{blog.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(blog)} title="Edit"><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
