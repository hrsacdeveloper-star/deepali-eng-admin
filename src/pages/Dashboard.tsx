import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MessageSquare, FileText, Users } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, enquiries: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, enquiriesData, recentEnq, recentProd] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('form_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('form_submissions').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          products: productsData.count || 0,
          enquiries: enquiriesData.count || 0,
        });

        setRecentEnquiries(recentEnq.data || []);
        setRecentProducts(recentProd.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <div className="flex gap-2">
          <Button asChild><Link to="/products">Add Product</Link></Button>
          <Button asChild variant="outline"><Link to="/form-submissions">View Enquiries</Link></Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{loading ? '-' : stats.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{loading ? '-' : stats.enquiries}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full max-w-full">
              <Table className="[&>div]:max-w-full min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6 whitespace-nowrap">No recent enquiries</TableCell>
                    </TableRow>
                  ) : (
                    recentEnquiries.map((enq: any) => (
                      <TableRow key={enq.id}>
                        <TableCell className="whitespace-nowrap font-medium">{(enq.payload as any)?.name || (enq.payload as any)?.email || 'Unknown'}</TableCell>
                        <TableCell className="whitespace-nowrap">{enq.type}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(enq.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full max-w-full">
              <Table className="[&>div]:max-w-full min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6 whitespace-nowrap">No recent products</TableCell>
                    </TableRow>
                  ) : (
                    recentProducts.map((prod: any) => (
                      <TableRow key={prod.id}>
                        <TableCell className="whitespace-nowrap font-medium truncate max-w-[200px]">{prod.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{prod.is_active ? 'Active' : 'Inactive'}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(prod.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
