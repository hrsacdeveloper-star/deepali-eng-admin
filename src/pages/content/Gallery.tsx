import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryImagesTab } from './components/gallery/GalleryImagesTab';
import { ClientsTab } from './components/gallery/ClientsTab';

export default function Gallery() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gallery & Clients</h2>
        <p className="text-muted-foreground">Manage your photo gallery and client logos.</p>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="gallery" className="py-2 px-4 whitespace-nowrap">Gallery Images</TabsTrigger>
            <TabsTrigger value="clients" className="py-2 px-4 whitespace-nowrap">Client Logos</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="gallery" className="mt-0">
          <GalleryImagesTab />
        </TabsContent>
        <TabsContent value="clients" className="mt-0">
          <ClientsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
