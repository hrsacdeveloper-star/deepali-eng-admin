import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, LogOut, KeyRound, UserPlus, Sun, Moon,
  Home, Globe, Package, ShieldCheck, Building2, ImageIcon, FileText, MessageSquare,
  MonitorPlay, LayoutTemplate, BarChart2, Star, Info, Heart,
  PackageSearch, Folders, Factory, Cog, Wrench, PenTool,
  Shield, CheckSquare, Microscope, Award,
  Users, Briefcase, Handshake, MessageCircleHeart,
  Images, DownloadCloud,
  Newspaper, HelpCircle,
  Inbox, Mail, FileJson, BrainCircuit,
  Search, UserCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const navigation = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { name: 'Overview', icon: LayoutDashboard, path: '/' },
      { name: 'Site Settings', icon: Settings, path: '/settings' },
    ],
  },
  {
    title: 'Home & Core',
    icon: Home,
    items: [
      { name: 'About Us Sections', icon: Info, path: '/about-us-sections' },
      { name: 'Core Values', icon: Heart, path: '/core-values' },
      { name: 'Global Partners', icon: Globe, path: '/global-partners' },
    ],
  },
  {
    title: 'Organization Structure',
    icon: Building2,
    items: [
      { name: 'Leadership Team', icon: UserPlus, path: '/leadership-team' },
      { name: 'Operations Team', icon: UserPlus, path: '/operations-team' },
    ],
  },
  {
    title: 'Products & Manufacturing',
    icon: Package,
    items: [
      { name: 'Products', icon: PackageSearch, path: '/products' },
      { name: 'Product Categories', icon: Folders, path: '/product-categories' },
      { name: 'Industries', icon: Factory, path: '/industries' },
      { name: 'Machines', icon: Cog, path: '/machines' },
      { name: 'Tool Room Machines', icon: PenTool, path: '/tool-room-machines' },
    ],
  },
  {
    title: 'Quality & Compliance',
    icon: ShieldCheck,
    items: [
      { name: 'Testing Procedures', icon: Microscope, path: '/testing-procedures' },
      { name: 'Certificates', icon: Award, path: '/certificates' },
    ],
  },
  {
    title: 'Company & People',
    icon: Building2,
    items: [
      { name: 'Careers', icon: Briefcase, path: '/careers' },
    ],
  },
  {
    title: 'Resources',
    icon: ImageIcon,
    items: [
      { name: 'Downloads', icon: DownloadCloud, path: '/downloads' },
    ],
  },
  {
    title: 'Interactions & Leads',
    icon: MessageSquare,
    items: [
      { name: 'Form Submissions', icon: Inbox, path: '/form-submissions' },
      { name: 'Chatbot Documents', icon: FileJson, path: '/chatbot-documents' },
      { name: 'Chatbot Knowledge', icon: BrainCircuit, path: '/chatbot-knowledge' },
    ],
  },
  {
    title: 'System',
    icon: Settings,
    items: [
      { name: 'Seo Meta', icon: Search, path: '/seo-meta' },
      { name: 'Profiles', icon: UserCircle, path: '/profiles' },
    ],
  },
];

export const AdminLayout = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const { user, role, signOut } = useAuth();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="flex h-16 items-center px-4 w-full">
            <div className="flex items-center gap-3 w-full pl-2">
              <div className="w-9 h-9 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm bg-inherit bg-cover bg-center bg-no-repeat bg-[url('/images/Deepalilogo.png')]">

              </div>
              <span className="truncate text-lg font-bold text-[#00B1F4] tracking-tight">Deepali Engineering</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="pb-16">
            {navigation.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-[#00B1F4] font-bold flex items-center gap-2">
                  <group.icon className="w-3.5 h-3.5" />
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                            <Link to={item.path} className="flex items-center gap-3">
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col min-w-0 bg-background">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground md:hidden" />
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="rounded-full p-2 text-[#00B1F4] hover:bg-[#00B1F4]/10 hover:text-[#00B1F4] transition-colors"
                title="Toggle Dark Mode"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-hidden">
                  <Avatar className="h-9 w-9 border border-[#00B1F4] cursor-pointer hover:ring-2 hover:ring-[#00B1F4]/20 transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-medium">{user?.email || 'Admin'}</span>
                    <span className="text-xs text-muted-foreground capitalize mt-0.5">{role || 'Administrator'}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/update-password" className="w-full cursor-pointer flex items-center">
                      <KeyRound className="w-4 h-4 mr-2" />
                      Update Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/give-access" className="w-full cursor-pointer flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Give Access
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-[#00B1F4] cursor-pointer font-medium focus:bg-[#00B1F4]/10 focus:text-[#00B1F4]">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-muted/30 relative">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
