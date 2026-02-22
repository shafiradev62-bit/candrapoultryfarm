import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectConnector } from "@/components/ProjectConnector";
import { initRedisConnector } from "@/services/redisProjectConnector";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  // Initialize Redis connector when AppLayout mounts
  initRedisConnector('farm-management-app', 'external-project');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-2">
                {/* Logo container with background image */}
                <div 
                  className="h-6 w-6 bg-contain bg-no-repeat bg-center"
                  style={{ 
                    backgroundImage: 'url(/logo.png)',
                    minWidth: '24px'
                  }}
                />
                <h2 className="text-sm font-semibold text-foreground">CANDRA POULTRY FARM</h2>
              </div>
              {title && (
                <span className="text-muted-foreground">•</span>
              )}
              {title && (
                <h2 className="text-sm font-medium text-foreground">{title}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-warning" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <ProjectConnector 
                projectId="farm-management-app" 
                targetProjectId="farm-hub-app"
                className="mb-6"
              />
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}