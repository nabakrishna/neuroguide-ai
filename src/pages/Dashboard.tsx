import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading } = useProjects();

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const recentProjects = projects.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your AI research companion is ready to help
            </p>
          </div>
          <Link to="/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Active Projects"
            value={projects.filter(p => p.status !== 'completed').length}
            icon={FolderKanban}
            trend="+2 this week"
          />
          <StatsCard
            title="Conversations"
            value={projects.length * 3}
            icon={MessageSquare}
            trend="+12 messages today"
          />
          <StatsCard
            title="Research Papers"
            value={28}
            icon={TrendingUp}
            trend="5 cited"
          />
          <StatsCard
            title="AI Sessions"
            value={156}
            icon={Sparkles}
            variant="highlight"
          />
        </div>

        {/* Quick Action - Start Research */}
        <div className="bg-gradient-hero rounded-2xl p-6 mb-8 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Start a Research Session</h2>
              <p className="text-muted-foreground">
                Ask NeuroGuide about ML architectures, audit your dataset, or explore research papers
              </p>
            </div>
            <Link to="/research">
              <Button size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first ML project to get started
              </p>
              <Link to="/projects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
