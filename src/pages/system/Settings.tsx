import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralTab } from './components/settings/GeneralTab';
import { SocialMediaTab } from './components/settings/SocialMediaTab';
import { FooterTab } from './components/settings/FooterTab';
import { SEOTab } from './components/settings/SEOTab';
import { NavigationTab } from './components/settings/NavigationTab';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Manage global site configurations, SEO, and navigation.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="general" className="py-2 px-4 whitespace-nowrap">General Info</TabsTrigger>
            <TabsTrigger value="social" className="py-2 px-4 whitespace-nowrap">Social Media</TabsTrigger>
            <TabsTrigger value="footer" className="py-2 px-4 whitespace-nowrap">Footer</TabsTrigger>
            <TabsTrigger value="seo" className="py-2 px-4 whitespace-nowrap">SEO Meta</TabsTrigger>
            <TabsTrigger value="nav" className="py-2 px-4 whitespace-nowrap">Navigation</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="general" className="mt-0">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="social" className="mt-0">
          <SocialMediaTab />
        </TabsContent>
        <TabsContent value="footer" className="mt-0">
          <FooterTab />
        </TabsContent>
        <TabsContent value="seo" className="mt-0">
          <SEOTab />
        </TabsContent>
        <TabsContent value="nav" className="mt-0">
          <NavigationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
