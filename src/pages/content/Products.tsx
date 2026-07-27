import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from './components/products/CategoriesTab';
import { ProductsListTab } from './components/products/ProductsListTab';

export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <p className="text-muted-foreground">Manage product catalog and categories.</p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <div className="overflow-x-auto w-full max-w-full pb-2 mb-4">
          <TabsList className="min-w-max flex h-auto p-1 bg-muted">
            <TabsTrigger value="products" className="py-2 px-4 whitespace-nowrap">Products</TabsTrigger>
            <TabsTrigger value="categories" className="py-2 px-4 whitespace-nowrap">Categories</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="products" className="mt-0">
          <ProductsListTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-0">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
