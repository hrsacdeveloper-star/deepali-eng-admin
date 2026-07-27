import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, Trash2 } from 'lucide-react';

export function WebsiteUsersTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState<any>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch website users');
    else setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this profile? (This only deletes profile metadata)')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Profile deleted');
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Website Users (Profiles)</h3>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date Joined</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Contact</TableHead>
              <TableHead className="whitespace-nowrap">Company</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : profiles.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users found</TableCell></TableRow>
            ) : (
              profiles.map(profile => (
                <TableRow key={profile.id}>
                  <TableCell className="whitespace-nowrap">{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{profile.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{profile.email}</div>
                    <div className="text-xs text-muted-foreground">{profile.phone || 'No phone'}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{profile.company || '-'}</div>
                    <div className="text-xs text-muted-foreground">{profile.designation || ''}</div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setViewItem(profile)}><Eye className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 text-sm mt-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div><span className="font-semibold text-muted-foreground block">Name</span>{viewItem.name}</div>
                <div><span className="font-semibold text-muted-foreground block">Email</span>{viewItem.email}</div>
                <div><span className="font-semibold text-muted-foreground block">Phone</span>{viewItem.phone || '-'}</div>
                <div><span className="font-semibold text-muted-foreground block">Joined On</span>{new Date(viewItem.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold text-muted-foreground block">Company</span>{viewItem.company || '-'}</div>
                <div><span className="font-semibold text-muted-foreground block">Designation</span>{viewItem.designation || '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
