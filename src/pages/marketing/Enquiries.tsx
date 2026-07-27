import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactTab } from './components/ContactTab';
import { RFQTab } from './components/RFQTab';
import { NewsletterTab } from './components/NewsletterTab';
import { TestimonialsTab } from './components/TestimonialsTab';

export default function Enquiries() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Marketing & Submissions</h2>
        <p className="text-muted-foreground">Manage user submissions, RFQs, newsletters, and testimonials.</p>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="contact" className="py-2 px-4 whitespace-nowrap">Contact Enquiries</TabsTrigger>
            <TabsTrigger value="rfq" className="py-2 px-4 whitespace-nowrap">RFQs</TabsTrigger>
            <TabsTrigger value="newsletter" className="py-2 px-4 whitespace-nowrap">Newsletter</TabsTrigger>
            <TabsTrigger value="testimonials" className="py-2 px-4 whitespace-nowrap">Testimonials</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="contact" className="mt-0">
          <ContactTab />
        </TabsContent>
        <TabsContent value="rfq" className="mt-0">
          <RFQTab />
        </TabsContent>
        <TabsContent value="newsletter" className="mt-0">
          <NewsletterTab />
        </TabsContent>
        <TabsContent value="testimonials" className="mt-0">
          <TestimonialsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
