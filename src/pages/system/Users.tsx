import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersTab } from './components/users/AdminUsersTab';
import { WebsiteUsersTab } from './components/users/WebsiteUsersTab';
import { RolesTab } from './components/users/RolesTab';

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage admin accounts, roles, and website users.</p>
      </div>

      <Tabs defaultValue="admins" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="admins" className="py-2 px-4 whitespace-nowrap">Admin Users</TabsTrigger>
            <TabsTrigger value="roles" className="py-2 px-4 whitespace-nowrap">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="website" className="py-2 px-4 whitespace-nowrap">Website Users</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="admins" className="mt-0">
          <AdminUsersTab />
        </TabsContent>
        <TabsContent value="roles" className="mt-0">
          <RolesTab />
        </TabsContent>
        <TabsContent value="website" className="mt-0">
          <WebsiteUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
