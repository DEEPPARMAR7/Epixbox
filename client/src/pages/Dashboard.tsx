import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Image, LayoutGrid, Globe, ShoppingBag, BarChart3, Settings, Users, Upload,
  ChevronLeft, ChevronRight, Plus, Search, Filter, MoreHorizontal, Eye, Trash2,
  Edit, Star, Download, FolderOpen, Clock, TrendingUp, DollarSign, Camera, Menu, Check
} from "lucide-react";

import template1 from "@/assets/template-1.jpg";
import template2 from "@/assets/template-2.jpg";
import template3 from "@/assets/template-3.jpg";
import template4 from "@/assets/template-4.jpg";
import platformImg from "@/assets/platform-showcase.jpg";
import heroImg from "@/assets/hero-main.jpg";
import featuresImg from "@/assets/features-hero.jpg";
import growImg from "@/assets/grow-section.jpg";
import BrandLogo from "@/components/BrandLogo";

const sidebarItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
  { icon: Image, label: "Photos", path: "/dashboard/photos" },
  { icon: FolderOpen, label: "Galleries", path: "/dashboard/galleries" },
  { icon: Globe, label: "Website", path: "/dashboard/website" },
  { icon: ShoppingBag, label: "Sales", path: "/dashboard/sales" },
  { icon: Users, label: "Clients", path: "/dashboard/clients" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const mockPhotos = [
  { id: 1, src: template1, title: "Spring Blooms", gallery: "Nature", date: "Mar 15", views: 234 },
  { id: 2, src: template2, title: "Studio Portrait", gallery: "Portraits", date: "Mar 14", views: 189 },
  { id: 3, src: template3, title: "Market Day", gallery: "Street", date: "Mar 13", views: 456 },
  { id: 4, src: template4, title: "Autumn River", gallery: "Landscapes", date: "Mar 12", views: 891 },
  { id: 5, src: platformImg, title: "Mountain Lake", gallery: "Landscapes", date: "Mar 11", views: 1203 },
  { id: 6, src: heroImg, title: "Joy", gallery: "Portraits", date: "Mar 10", views: 567 },
  { id: 7, src: featuresImg, title: "Sunset Surf", gallery: "Lifestyle", date: "Mar 9", views: 345 },
  { id: 8, src: growImg, title: "Summit", gallery: "Adventure", date: "Mar 8", views: 789 },
];

const mockGalleries = [
  { id: 1, name: "Nature Collection", count: 48, cover: template1, status: "Published", views: 2340 },
  { id: 2, name: "Portrait Series", count: 32, cover: template2, status: "Published", views: 1890 },
  { id: 3, name: "Street Stories", count: 65, cover: template3, status: "Draft", views: 0 },
  { id: 4, name: "Landscape Dreams", count: 27, cover: template4, status: "Published", views: 4560 },
  { id: 5, name: "Client: Johnson Wedding", count: 412, cover: platformImg, status: "Private", views: 89 },
  { id: 6, name: "Adventure Portfolio", count: 56, cover: growImg, status: "Published", views: 3210 },
];

const mockClients = [
  { id: 1, name: "Emma & James Johnson", email: "emma@email.com", galleries: 3, totalSpent: "$1,240", lastActive: "2 days ago" },
  { id: 2, name: "Sarah Miller", email: "sarah.m@email.com", galleries: 1, totalSpent: "$450", lastActive: "1 week ago" },
  { id: 3, name: "David Chen", email: "d.chen@email.com", galleries: 2, totalSpent: "$890", lastActive: "3 days ago" },
  { id: 4, name: "Lisa Park", email: "lisa.park@email.com", galleries: 1, totalSpent: "$320", lastActive: "Today" },
  { id: 5, name: "Michael Brown", email: "m.brown@email.com", galleries: 4, totalSpent: "$2,100", lastActive: "5 days ago" },
];

const DashboardPage = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPath = location.pathname;
  const activeSection = currentPath.split("/dashboard/")[1] || "overview";

  const renderContent = () => {
    switch (activeSection) {
      case "photos":
        return <PhotosPanel />;
      case "galleries":
        return <GalleriesPanel />;
      case "website":
        return <WebsitePanel />;
      case "sales":
        return <SalesPanel />;
      case "clients":
        return <ClientsPanel />;
      case "analytics":
        return <AnalyticsPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-card flex">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-foreground text-primary-foreground transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/10">
          {!sidebarCollapsed && (
            <Link to="/" aria-label="EpixBox home">
              <BrandLogo theme="dark" textClassName="text-lg" />
            </Link>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-primary-foreground/60 hover:text-primary-foreground">
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => {
            const isActive = currentPath === item.path || (item.path === "/dashboard" && currentPath === "/dashboard");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-primary-foreground/10 text-accent"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                }`}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && <span className="font-body text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="p-4 border-t border-primary-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent flex items-center justify-center">
                <Camera size={16} className="text-accent-foreground" />
              </div>
              <div>
                <p className="font-body text-sm text-primary-foreground">Jane Doe</p>
                <p className="font-body text-xs text-primary-foreground/50">Pro Plan</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-foreground text-primary-foreground h-14 flex items-center justify-between px-4">
        <Link to="/" aria-label="EpixBox home">
          <BrandLogo theme="dark" textClassName="text-lg" />
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-primary-foreground">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-foreground/95 pt-14">
          <nav className="py-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-primary-foreground/80 hover:text-primary-foreground"
              >
                <item.icon size={20} />
                <span className="font-body text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        {renderContent()}
      </main>
    </div>
  );
};

/* ============ OVERVIEW PANEL ============ */
const OverviewPanel = () => {
  const stats = [
    { label: "Total Photos", value: "2,847", icon: Image, change: "+124 this month" },
    { label: "Total Views", value: "45.2K", icon: Eye, change: "+12% vs last month" },
    { label: "Revenue", value: "$3,240", icon: DollarSign, change: "+8% vs last month" },
    { label: "Active Clients", value: "23", icon: Users, change: "+3 new this month" },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Dashboard</h1>
          <p className="font-body text-sm text-muted-foreground">Welcome back, Jane</p>
        </div>
        <button className="btn-cta text-xs py-2 px-5">
          <Upload size={16} /> Upload Photos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-background border-2 border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className="text-muted-foreground" />
              <TrendingUp size={14} className="text-accent-foreground" />
            </div>
            <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{s.label}</p>
            <p className="font-body text-xs text-accent-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Photos */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">Recent Uploads</h2>
          <Link to="/dashboard/photos" className="font-body text-sm text-muted-foreground hover:text-foreground underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockPhotos.slice(0, 4).map((photo) => (
            <div key={photo.id} className="group relative">
              <img src={photo.src} alt={photo.title} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="bg-primary-foreground p-2"><Eye size={16} className="text-foreground" /></button>
                <button className="bg-primary-foreground p-2"><Edit size={16} className="text-foreground" /></button>
              </div>
              <p className="font-body text-sm text-foreground mt-2">{photo.title}</p>
              <p className="font-body text-xs text-muted-foreground">{photo.views} views</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Recent Activity</h2>
        <div className="bg-background border-2 border-border divide-y divide-border">
          {[
            { action: "Emma Johnson downloaded 12 photos from 'Wedding Gallery'", time: "2 hours ago" },
            { action: "New order: Canvas print 24x36 from David Chen", time: "5 hours ago" },
            { action: "Sarah Miller favorited 8 photos in 'Portrait Series'", time: "Yesterday" },
            { action: "Your site had 342 unique visitors today", time: "Today" },
          ].map((activity, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <p className="font-body text-sm text-foreground">{activity.action}</p>
              <span className="font-body text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============ PHOTOS PANEL ============ */
const PhotosPanel = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">Photos</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full bg-background border-2 border-border pl-10 pr-4 py-2 font-body text-sm text-foreground focus:border-foreground focus:outline-none"
              placeholder="Search photos..."
            />
          </div>
          <button className="btn-outline-cta text-xs py-2 px-4">
            <Filter size={14} /> Filter
          </button>
          <button className="btn-cta text-xs py-2 px-4">
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-accent text-accent-foreground px-4 py-3 mb-4 flex items-center justify-between">
          <span className="font-body text-sm font-medium">{selected.length} photo(s) selected</span>
          <div className="flex gap-2">
            <button className="font-heading text-xs uppercase tracking-wider hover:underline">Add to Gallery</button>
            <button className="font-heading text-xs uppercase tracking-wider hover:underline">Download</button>
            <button className="font-heading text-xs uppercase tracking-wider hover:underline">Delete</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockPhotos.map((photo) => (
          <div
            key={photo.id}
            className={`group relative cursor-pointer ${
              selected.includes(photo.id) ? "ring-2 ring-accent" : ""
            }`}
            onClick={() =>
              setSelected((prev) =>
                prev.includes(photo.id) ? prev.filter((id) => id !== photo.id) : [...prev, photo.id]
              )
            }
          >
            <img src={photo.src} alt={photo.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
              <button className="bg-primary-foreground p-1.5"><Star size={14} className="text-foreground" /></button>
              <button className="bg-primary-foreground p-1.5"><Download size={14} className="text-foreground" /></button>
              <button className="bg-primary-foreground p-1.5"><Trash2 size={14} className="text-foreground" /></button>
            </div>
            {selected.includes(photo.id) && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-accent flex items-center justify-center">
                <Check size={14} className="text-accent-foreground" />
              </div>
            )}
            <div className="p-3 bg-background">
              <p className="font-body text-sm text-foreground font-medium">{photo.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-body text-xs text-muted-foreground">{photo.gallery}</span>
                <span className="font-body text-xs text-muted-foreground">{photo.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============ GALLERIES PANEL ============ */
const GalleriesPanel = () => {
  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">Galleries</h1>
        <button className="btn-cta text-xs py-2 px-5">
          <Plus size={16} /> New Gallery
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGalleries.map((gallery) => (
          <div key={gallery.id} className="bg-background border-2 border-border group">
            <div className="relative">
              <img src={gallery.cover} alt={gallery.name} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="bg-primary-foreground px-4 py-2 font-heading text-xs uppercase tracking-wider text-foreground">
                  Edit
                </button>
                <button className="bg-primary-foreground px-4 py-2 font-heading text-xs uppercase tracking-wider text-foreground">
                  View
                </button>
              </div>
              <span className={`absolute top-3 right-3 font-heading text-xs uppercase tracking-wider px-3 py-1 ${
                gallery.status === "Published" ? "bg-accent text-accent-foreground" :
                gallery.status === "Draft" ? "bg-secondary text-secondary-foreground" :
                "bg-foreground text-primary-foreground"
              }`}>
                {gallery.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-sm text-foreground mb-1">{gallery.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground">{gallery.count} photos</span>
                <span className="font-body text-xs text-muted-foreground">{gallery.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============ WEBSITE PANEL ============ */
const WebsitePanel = () => {
  const pages = [
    { name: "Home", status: "Live", lastEdited: "2 hours ago" },
    { name: "Portfolio", status: "Live", lastEdited: "Yesterday" },
    { name: "About", status: "Live", lastEdited: "3 days ago" },
    { name: "Contact", status: "Live", lastEdited: "1 week ago" },
    { name: "Pricing", status: "Draft", lastEdited: "2 weeks ago" },
    { name: "Blog", status: "Draft", lastEdited: "1 month ago" },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Website Builder</h1>
          <p className="font-body text-sm text-muted-foreground">janedoephotography.epixbox.com</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline-cta text-xs py-2 px-4">
            <Eye size={14} /> Preview
          </button>
          <button className="btn-cta text-xs py-2 px-4">
            <Globe size={14} /> Publish
          </button>
        </div>
      </div>

      {/* Site Preview */}
      <div className="bg-background border-2 border-border mb-8">
        <div className="bg-secondary px-4 py-2 flex items-center gap-2 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="font-body text-xs text-muted-foreground ml-2">janedoephotography.epixbox.com</span>
        </div>
        <div className="p-6">
          <img src={platformImg} alt="Website preview" className="w-full h-64 object-cover mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <img src={template1} alt="" className="w-full h-24 object-cover" />
            <img src={template2} alt="" className="w-full h-24 object-cover" />
            <img src={template3} alt="" className="w-full h-24 object-cover" />
          </div>
        </div>
      </div>

      {/* Pages */}
      <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Pages</h2>
      <div className="bg-background border-2 border-border divide-y divide-border mb-8">
        {pages.map((page) => (
          <div key={page.name} className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-muted-foreground" />
              <span className="font-body text-sm text-foreground font-medium">{page.name}</span>
              <span className={`font-heading text-xs uppercase tracking-wider px-2 py-0.5 ${
                page.status === "Live" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
                {page.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-body text-xs text-muted-foreground hidden md:block">{page.lastEdited}</span>
              <button className="text-muted-foreground hover:text-foreground"><Edit size={16} /></button>
              <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Customization */}
      <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Customization</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Theme", desc: "Change colors, fonts, and layout" },
          { title: "Navigation", desc: "Edit menu items and structure" },
          { title: "SEO", desc: "Meta tags, sitemap, and analytics" },
        ].map((item) => (
          <button key={item.title} className="bg-background border-2 border-border p-5 text-left hover:border-foreground transition-colors">
            <h3 className="font-heading font-bold text-sm text-foreground mb-1">{item.title}</h3>
            <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============ SALES PANEL ============ */
const SalesPanel = () => {
  const orders = [
    { id: "#1247", client: "David Chen", product: "Canvas 24x36", amount: "$189.00", status: "Fulfilled", date: "Mar 15" },
    { id: "#1246", client: "Emma Johnson", product: "Digital Download (12)", amount: "$96.00", status: "Completed", date: "Mar 14" },
    { id: "#1245", client: "Sarah Miller", product: "Print Package", amount: "$245.00", status: "Processing", date: "Mar 13" },
    { id: "#1244", client: "Lisa Park", product: "Metal Print 16x20", amount: "$159.00", status: "Fulfilled", date: "Mar 12" },
    { id: "#1243", client: "Michael Brown", product: "Photo Book", amount: "$89.00", status: "Completed", date: "Mar 11" },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">Sales</h1>
        <button className="btn-outline-cta text-xs py-2 px-4">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "This Month", value: "$3,240", change: "+8%" },
          { label: "Last Month", value: "$2,980", change: "+12%" },
          { label: "Total Orders", value: "47", change: "+5" },
          { label: "Avg. Order", value: "$68.94", change: "+$4.20" },
        ].map((s) => (
          <div key={s.label} className="bg-background border-2 border-border p-5">
            <p className="font-body text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-accent-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Recent Orders</h2>
      <div className="bg-background border-2 border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground">Order</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground">Client</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground hidden md:table-cell">Product</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground">Amount</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground hidden md:table-cell">Status</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-card/50">
                <td className="font-body text-sm py-3 px-5 text-foreground font-medium">{order.id}</td>
                <td className="font-body text-sm py-3 px-5 text-foreground">{order.client}</td>
                <td className="font-body text-sm py-3 px-5 text-muted-foreground hidden md:table-cell">{order.product}</td>
                <td className="font-body text-sm py-3 px-5 text-foreground font-medium">{order.amount}</td>
                <td className="py-3 px-5 hidden md:table-cell">
                  <span className={`font-heading text-xs uppercase tracking-wider px-2 py-0.5 ${
                    order.status === "Fulfilled" || order.status === "Completed"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="font-body text-sm py-3 px-5 text-muted-foreground hidden md:table-cell">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============ CLIENTS PANEL ============ */
const ClientsPanel = () => {
  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">Clients</h1>
        <button className="btn-cta text-xs py-2 px-5">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="bg-background border-2 border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground">Name</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground hidden md:table-cell">Email</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground">Galleries</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground">Spent</th>
              <th className="text-left font-heading text-xs uppercase tracking-wider py-3 px-5 text-foreground hidden md:table-cell">Last Active</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {mockClients.map((client) => (
              <tr key={client.id} className="border-b border-border hover:bg-card/50">
                <td className="font-body text-sm py-3 px-5 text-foreground font-medium">{client.name}</td>
                <td className="font-body text-sm py-3 px-5 text-muted-foreground hidden md:table-cell">{client.email}</td>
                <td className="font-body text-sm py-3 px-5 text-foreground">{client.galleries}</td>
                <td className="font-body text-sm py-3 px-5 text-foreground font-medium">{client.totalSpent}</td>
                <td className="font-body text-sm py-3 px-5 text-muted-foreground hidden md:table-cell">{client.lastActive}</td>
                <td className="py-3 px-5">
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============ ANALYTICS PANEL ============ */
const AnalyticsPanel = () => {
  const dailyViews = [320, 450, 380, 520, 410, 680, 590, 720, 650, 480, 560, 710, 830, 620];
  const maxView = Math.max(...dailyViews);

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">Analytics</h1>
        <div className="flex gap-2">
          {["7d", "30d", "90d", "1y"].map((period) => (
            <button
              key={period}
              className={`font-heading text-xs uppercase tracking-wider px-3 py-2 border-2 transition-colors ${
                period === "30d" ? "border-foreground bg-foreground text-primary-foreground" : "border-border text-foreground hover:border-foreground"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Page Views", value: "12,430", change: "+18%" },
          { label: "Unique Visitors", value: "3,247", change: "+12%" },
          { label: "Avg. Session", value: "4m 32s", change: "+8%" },
          { label: "Top Gallery Views", value: "4,560", change: "+22%" },
        ].map((s) => (
          <div key={s.label} className="bg-background border-2 border-border p-5">
            <p className="font-body text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-accent-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-background border-2 border-border p-6 mb-10">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-6">Daily Views</h2>
        <div className="flex items-end gap-2 h-48">
          {dailyViews.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-accent hover:bg-foreground transition-colors cursor-pointer"
                style={{ height: `${(v / maxView) * 100}%` }}
                title={`${v} views`}
              />
              <span className="font-body text-[10px] text-muted-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Content */}
      <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Top Content</h2>
      <div className="bg-background border-2 border-border divide-y divide-border">
        {mockGalleries.filter(g => g.status === "Published").slice(0, 4).map((g) => (
          <div key={g.id} className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={g.cover} alt={g.name} className="w-12 h-12 object-cover" />
              <div>
                <p className="font-body text-sm text-foreground font-medium">{g.name}</p>
                <p className="font-body text-xs text-muted-foreground">{g.count} photos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-sm text-foreground">{g.views.toLocaleString()}</p>
              <p className="font-body text-xs text-muted-foreground">views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============ SETTINGS PANEL ============ */
const SettingsPanel = () => {
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-8">Settings</h1>

      {/* Profile */}
      <div className="bg-background border-2 border-border p-6 mb-6">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-6">Profile</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">Full Name</label>
            <input className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none" defaultValue="Jane Doe" />
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">Email</label>
            <input className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none" defaultValue="jane@example.com" />
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">Business Name</label>
            <input className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none" defaultValue="Jane Doe Photography" />
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-foreground block mb-2">Website URL</label>
            <input className="w-full bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none" defaultValue="janedoephotography.epixbox.com" />
          </div>
        </div>
        <button className="btn-cta text-xs py-2 px-5 mt-6">Save Changes</button>
      </div>

      {/* Plan */}
      <div className="bg-background border-2 border-border p-6 mb-6">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-foreground">Current Plan: <span className="font-bold">Pro</span></p>
            <p className="font-body text-xs text-muted-foreground mt-1">Renews on April 15, 2026 · $27/mo billed annually</p>
          </div>
          <Link to="/pricing" className="btn-outline-cta text-xs py-2 px-4">
            Change Plan
          </Link>
        </div>
      </div>

      {/* Domain */}
      <div className="bg-background border-2 border-border p-6 mb-6">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">Custom Domain</h2>
        <div className="flex items-center gap-4">
          <input className="flex-1 bg-card border-2 border-border px-4 py-3 font-body text-sm text-foreground focus:border-foreground focus:outline-none" placeholder="www.yoursite.com" />
          <button className="btn-outline-cta text-xs py-3 px-5">Connect</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-background border-2 border-destructive/30 p-6">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-destructive mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-foreground">Delete Account</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Permanently delete your account and all data</p>
          </div>
          <button className="btn-outline-cta text-xs py-2 px-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

/* Fix: need Check import for PhotosPanel */
import { Check } from "lucide-react";

export default DashboardPage;
