import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacilitiesTab } from './components/infrastructure/FacilitiesTab';
import { MachinesTab } from './components/infrastructure/MachinesTab';

export default function Infrastructure() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Infrastructure</h2>
        <p className="text-muted-foreground">Manage facilities and machines in your manufacturing plant.</p>
      </div>

      <Tabs defaultValue="facilities" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="facilities" className="py-2 px-4 whitespace-nowrap">Facilities</TabsTrigger>
            <TabsTrigger value="machines" className="py-2 px-4 whitespace-nowrap">Machines</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="facilities" className="mt-0">
          <FacilitiesTab />
        </TabsContent>
        <TabsContent value="machines" className="mt-0">
          <MachinesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
