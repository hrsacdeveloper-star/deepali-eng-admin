import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';

import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Login } from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

import ProductCategories from '@/pages/content_new/ProductCategories';
import Products from '@/pages/content_new/Products';
import Industries from '@/pages/content_new/Industries';
import Machines from '@/pages/content_new/Machines';
import Gallery from '@/pages/content_new/Gallery';
import Certificates from '@/pages/content_new/Certificates';
import Clients from '@/pages/content_new/Clients';
import Testimonials from '@/pages/content_new/Testimonials';
import Team from '@/pages/content_new/Team';
import Articles from '@/pages/content_new/Articles';
import Faqs from '@/pages/content_new/Faqs';
import Downloads from '@/pages/content_new/Downloads';
import Careers from '@/pages/content_new/Careers';
import FormSubmissions from '@/pages/content_new/FormSubmissions';
import NewsletterSubscribers from '@/pages/content_new/NewsletterSubscribers';
import SeoMeta from '@/pages/content_new/SeoMeta';
import SiteSettings from '@/pages/content_new/SiteSettings';
import ChatbotDocuments from '@/pages/content_new/ChatbotDocuments';
import ChatbotKnowledge from '@/pages/content_new/ChatbotKnowledge';
import Profiles from '@/pages/content_new/Profiles';
import AboutUsSections from '@/pages/content_new/AboutUsSections';
import CoreValues from '@/pages/content_new/CoreValues';
import GlobalPartners from '@/pages/content_new/GlobalPartners';
import LeadershipTeam from '@/pages/content_new/LeadershipTeam';
import OperationsTeam from '@/pages/content_new/OperationsTeam';
import ToolRoomSections from '@/pages/content_new/ToolRoomSections';
import ToolRoomMachines from '@/pages/content_new/ToolRoomMachines';
import QualitySections from '@/pages/content_new/QualitySections';
import QualityStandards from '@/pages/content_new/QualityStandards';
import TestingProcedures from '@/pages/content_new/TestingProcedures';
import GiveAccess from '@/pages/system/GiveAccess';
import UpdatePassword from '@/pages/system/UpdatePassword';


const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <IntersectObserver />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<RouteGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="seo-meta" element={<SeoMeta />} />
                            <Route path="product-categories" element={<ProductCategories />} />
              <Route path="products" element={<Products />} />
              <Route path="about-us-sections" element={<AboutUsSections />} />
              <Route path="core-values" element={<CoreValues />} />
              <Route path="global-partners" element={<GlobalPartners />} />
              <Route path="leadership-team" element={<LeadershipTeam />} />
              <Route path="operations-team" element={<OperationsTeam />} />
              <Route path="tool-room-sections" element={<ToolRoomSections />} />
              <Route path="tool-room-machines" element={<ToolRoomMachines />} />
              <Route path="quality-sections" element={<QualitySections />} />
              <Route path="quality-standards" element={<QualityStandards />} />
              <Route path="testing-procedures" element={<TestingProcedures />} />

              <Route path="industries" element={<Industries />} />
              <Route path="machines" element={<Machines />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="clients" element={<Clients />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="team" element={<Team />} />
              <Route path="articles" element={<Articles />} />
              <Route path="faqs" element={<Faqs />} />
              <Route path="downloads" element={<Downloads />} />
              <Route path="careers" element={<Careers />} />
              <Route path="form-submissions" element={<FormSubmissions />} />
              <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />
              <Route path="chatbot-documents" element={<ChatbotDocuments />} />
              <Route path="chatbot-knowledge" element={<ChatbotKnowledge />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="give-access" element={<GiveAccess />} />
              <Route path="update-password" element={<UpdatePassword />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
