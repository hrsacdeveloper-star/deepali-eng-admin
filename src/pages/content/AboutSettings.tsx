import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoreValuesTab } from './components/about/CoreValuesTab';
import { TeamTab } from './components/about/TeamTab';
import { HomeAboutTab } from './components/home/HomeAboutTab'; // Reusing this for Company Story & Vision/Mission

export default function AboutSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">About Us Page</h2>
        <p className="text-muted-foreground">Manage company overview, vision, values, and leadership team.</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="overview" className="py-2 px-4 whitespace-nowrap">Company Overview & Vision</TabsTrigger>
            <TabsTrigger value="values" className="py-2 px-4 whitespace-nowrap">Core Values</TabsTrigger>
            <TabsTrigger value="team" className="py-2 px-4 whitespace-nowrap">Leadership Team</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          <HomeAboutTab />
        </TabsContent>
        <TabsContent value="values" className="mt-0">
          <CoreValuesTab />
        </TabsContent>
        <TabsContent value="team" className="mt-0">
          <TeamTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
