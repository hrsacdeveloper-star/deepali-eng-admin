import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

export function FeaturedSectionsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [featured, setFeatured] = useState<{ products: string[], partners: string[], blogs: string[] }>({
    products: [], partners: [], blogs: []
  });

  // Data sources
  const [products, setProducts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, productsRes, partnersRes, blogsRes] = await Promise.all([
        supabase.from('site_settings').select('id, featured_sections').limit(1).single(),
        supabase.from('products').select('id, name'),
        supabase.from('partners').select('id, name'),
        supabase.from('articles').select('id, title')
      ]);

      if (settingsRes.data) {
        setSettingsId(settingsRes.data.id);
        const sections = settingsRes.data.featured_sections || {};
        setFeatured({
          products: sections.products || [],
          partners: sections.partners || [],
          blogs: sections.blogs || []
        });
      }

      setProducts(productsRes.data || []);
      setPartners(partnersRes.data || []);
      setBlogs(blogsRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settingsId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings')
        .update({ featured_sections: featured })
        .eq('id', settingsId);
      
      if (error) throw error;
      toast.success('Featured sections updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const SelectionList = ({ 
    items, 
    selectedIds, 
    onChange, 
    labelKey = 'name' 
  }: { 
    items: any[], 
    selectedIds: string[], 
    onChange: (ids: string[]) => void,
    labelKey?: string
  }) => {
    return (
      <div className="space-y-4">
        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={item.id} 
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(checked) => {
                    if (checked) onChange([...selectedIds, item.id]);
                    else onChange(selectedIds.filter(id => id !== item.id));
                  }}
                />
                <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {item[labelKey]}
                </label>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-muted-foreground">No items available.</p>}
          </div>
        </ScrollArea>
        <p className="text-sm text-muted-foreground">{selectedIds.length} selected</p>
      </div>
    );
  };

  if (loading) return <div className="py-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Featured Products</CardTitle>
            <CardDescription>Select products to highlight on the home page.</CardDescription>
          </CardHeader>
          <CardContent>
            <SelectionList 
              items={products} 
              selectedIds={featured.products} 
              onChange={ids => setFeatured({ ...featured, products: ids })} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Partners</CardTitle>
            <CardDescription>Select partners/clients to highlight.</CardDescription>
          </CardHeader>
          <CardContent>
            <SelectionList 
              items={partners} 
              selectedIds={featured.partners} 
              onChange={ids => setFeatured({ ...featured, partners: ids })} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Blogs</CardTitle>
            <CardDescription>Select recent news or articles to highlight.</CardDescription>
          </CardHeader>
          <CardContent>
            <SelectionList 
              items={blogs} 
              selectedIds={featured.blogs} 
              labelKey="title"
              onChange={ids => setFeatured({ ...featured, blogs: ids })} 
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Featured Sections'}
        </Button>
      </div>
    </div>
  );
}
