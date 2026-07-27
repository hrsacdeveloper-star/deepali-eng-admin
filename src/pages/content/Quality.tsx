import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificationsTab } from './components/quality/CertificationsTab';
import { QualityStandardsTab } from './components/quality/QualityStandardsTab';
import { TestingProceduresTab } from './components/quality/TestingProceduresTab';

export default function Quality() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quality Management</h2>
        <p className="text-muted-foreground">Manage certifications, standards, and testing procedures.</p>
      </div>

      <Tabs defaultValue="certs" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="certs" className="py-2 px-4 whitespace-nowrap">Certifications</TabsTrigger>
            <TabsTrigger value="standards" className="py-2 px-4 whitespace-nowrap">Quality Standards</TabsTrigger>
            <TabsTrigger value="testing" className="py-2 px-4 whitespace-nowrap">Testing Procedures</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="certs" className="mt-0">
          <CertificationsTab />
        </TabsContent>
        <TabsContent value="standards" className="mt-0">
          <QualityStandardsTab />
        </TabsContent>
        <TabsContent value="testing" className="mt-0">
          <TestingProceduresTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
