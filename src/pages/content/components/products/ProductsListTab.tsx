import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Copy, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category_id: z.string().optional().nullable(),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string()).optional(),
  industry_tags: z.array(z.string()).optional(),
  pdf_catalog: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductsListTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Custom states for JSONB fields
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { 
      name: '', slug: '', category_id: null, short_description: '', full_description: '', 
      specifications: {}, images: [], industry_tags: [], pdf_catalog: '', is_active: true, is_featured: false 
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, indRes] = await Promise.all([
        supabase.from('products').select(`*, product_categories(name)`).order('created_at', { ascending: false }),
        supabase.from('product_categories').select('id, name').eq('is_active', true),
        supabase.from('industries').select('id, name').eq('is_active', true)
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setIndustries(indRes.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // transform specs
      const specsRecord: Record<string, string> = {};
      specs.forEach(s => { if (s.key) specsRecord[s.key] = s.value; });
      
      const payload = { 
        ...data, 
        category_id: data.category_id === 'none' ? null : data.category_id,
        specifications: specsRecord,
        images: images,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product added');
      }
      setOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDuplicate = async (product: any) => {
    try {
      const { id, created_at, updated_at, product_categories, ...payload } = product;
      payload.name = `${payload.name} (Copy)`;
      payload.slug = `${payload.slug}-copy-${Date.now()}`;
      const { error } = await supabase.from('products').insert([payload]);
      if (error) throw error;
      toast.success('Product duplicated');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (prod: any) => {
    setEditingId(prod.id);
    
    // Parse specs
    const s: {key: string, value: string}[] = [];
    if (prod.specifications) {
      Object.entries(prod.specifications).forEach(([k, v]) => {
        s.push({ key: k, value: v as string });
      });
    }
    setSpecs(s);
    setImages(prod.images || []);

    form.reset({ 
      name: prod.name, 
      slug: prod.slug, 
      category_id: prod.category_id || 'none',
      short_description: prod.short_description || '',
      full_description: prod.full_description || '',
      industry_tags: prod.industry_tags || [],
      pdf_catalog: prod.pdf_catalog || '',
      is_active: prod.is_active,
      is_featured: prod.is_featured
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setSpecs([]);
    setImages([]);
    form.reset({ 
      name: '', slug: '', category_id: 'none', short_description: '', full_description: '', 
      industry_tags: [], pdf_catalog: '', is_active: true, is_featured: false 
    });
    setOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const val = e.target.value;
    onChange(val);
    if (!editingId) {
      form.setValue('slug', val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Product Catalog</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-4xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Product Name *</FormLabel><FormControl><Input {...field} onChange={e => handleNameChange(e, field.onChange)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField control={form.control} name="pdf_catalog" render={({ field }) => (
                    <FormItem><FormLabel>PDF Catalog</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} accept=".pdf" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="short_description" render={({ field }) => (
                  <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="full_description" render={({ field }) => (
                  <FormItem><FormLabel>Full Description</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="space-y-2">
                  <FormLabel>Images</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative group rounded border">
                        <img src={img} alt="Product" className="w-full aspect-square object-cover" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="border border-dashed rounded aspect-square flex items-center justify-center p-2">
                      <FileUpload onChange={(url) => setImages([...images, url])} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Specifications</FormLabel>
                  {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Key (e.g. Material)" value={spec.key} onChange={e => {
                        const newSpecs = [...specs];
                        newSpecs[i].key = e.target.value;
                        setSpecs(newSpecs);
                      }} />
                      <Input placeholder="Value (e.g. Steel)" value={spec.value} onChange={e => {
                        const newSpecs = [...specs];
                        newSpecs[i].value = e.target.value;
                        setSpecs(newSpecs);
                      }} />
                      <Button type="button" variant="ghost" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setSpecs([...specs, { key: '', value: '' }])}>Add Specification</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Active Status</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="is_featured" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Featured Product</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full">Save Product</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">Product Name</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap text-center">Featured</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No products found</TableCell></TableRow>
            ) : (
              products.map(prod => (
                <TableRow key={prod.id}>
                  <TableCell className="whitespace-nowrap">
                    {prod.images && prod.images.length > 0 ? (
                      <img src={prod.images[0]} alt="img" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-muted flex items-center justify-center rounded text-xs text-muted-foreground">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{prod.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{prod.product_categories?.name || '-'}</TableCell>
                  <TableCell className="text-center">{prod.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-center">{prod.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(prod)} title="Duplicate"><Copy className="w-4 h-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(prod)} title="Edit"><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(prod.id)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
