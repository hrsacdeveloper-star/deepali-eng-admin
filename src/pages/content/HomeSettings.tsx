import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroSlidesTab } from './components/home/HeroSlidesTab';
import { StatsCountersTab } from './components/home/StatsCountersTab';
import { HomeAboutTab } from './components/home/HomeAboutTab';
import { FeaturedSectionsTab } from './components/home/FeaturedSectionsTab';

export default function HomeSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Home Page Settings</h2>
        <p className="text-muted-foreground">Manage content that appears on the website home page.</p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="hero" className="py-2 px-4 whitespace-nowrap">Hero Slides</TabsTrigger>
            <TabsTrigger value="stats" className="py-2 px-4 whitespace-nowrap">Stats Counters</TabsTrigger>
            <TabsTrigger value="about" className="py-2 px-4 whitespace-nowrap">About Section</TabsTrigger>
            <TabsTrigger value="featured" className="py-2 px-4 whitespace-nowrap">Featured Sections</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="hero" className="mt-0">
          <HeroSlidesTab />
        </TabsContent>
        <TabsContent value="stats" className="mt-0">
          <StatsCountersTab />
        </TabsContent>
        <TabsContent value="about" className="mt-0">
          <HomeAboutTab />
        </TabsContent>
        <TabsContent value="featured" className="mt-0">
          <FeaturedSectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
