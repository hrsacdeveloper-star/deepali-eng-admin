import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolMachinesTab } from './components/toolroom/ToolMachinesTab';
import { ToolFacilitiesTab } from './components/toolroom/ToolFacilitiesTab';
import { ToolTeamTab } from './components/toolroom/ToolTeamTab';

export default function ToolRoom() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tool Room</h2>
        <p className="text-muted-foreground">Manage machines, facilities, and team members in the Tool Room.</p>
      </div>

      <Tabs defaultValue="machines" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="machines" className="py-2 px-4 whitespace-nowrap">Machines</TabsTrigger>
            <TabsTrigger value="facilities" className="py-2 px-4 whitespace-nowrap">Facilities</TabsTrigger>
            <TabsTrigger value="team" className="py-2 px-4 whitespace-nowrap">Team</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="machines" className="mt-0">
          <ToolMachinesTab />
        </TabsContent>
        <TabsContent value="facilities" className="mt-0">
          <ToolFacilitiesTab />
        </TabsContent>
        <TabsContent value="team" className="mt-0">
          <ToolTeamTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
