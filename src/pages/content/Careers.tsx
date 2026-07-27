import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobsTab } from './components/careers/JobsTab';
import { ApplicationsTab } from './components/careers/ApplicationsTab';

export default function Careers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Careers</h2>
        <p className="text-muted-foreground">Manage job openings and review candidate applications.</p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="jobs" className="py-2 px-4 whitespace-nowrap">Job Openings</TabsTrigger>
            <TabsTrigger value="apps" className="py-2 px-4 whitespace-nowrap">Applications</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="jobs" className="mt-0">
          <JobsTab />
        </TabsContent>
        <TabsContent value="apps" className="mt-0">
          <ApplicationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
