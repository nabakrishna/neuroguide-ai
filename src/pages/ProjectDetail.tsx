import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  MoreHorizontal,
  FileText,
  Code,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusColors: Record<string, string> = {
  ideation: 'bg-neuro-purple-light text-neuro-purple border-neuro-purple/20',
  data_audit: 'bg-neuro-amber-light text-neuro-amber border-neuro-amber/20',
  modeling: 'bg-neuro-blue-light text-neuro-blue border-neuro-blue/20',
  completed: 'bg-neuro-green-light text-neuro-green border-neuro-green/20',
};

const statusLabels: Record<string, string> = {
  ideation: 'Ideation',
  data_audit: 'Data Audit',
  modeling: 'Modeling',
  completed: 'Completed',
};

const checklist = [
  { id: 'data', label: 'Dataset validated', icon: BarChart3 },
  { id: 'leakage', label: 'No data leakage detected', icon: AlertTriangle },
  { id: 'code', label: 'Training code generated', icon: Code },
  { id: 'docs', label: 'Documentation complete', icon: FileText },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        navigate('/projects');
        return;
      }

      setProject(data as Project);
      setLoading(false);
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">{project.title}</h1>
                  <Badge
                    variant="outline"
                    className={cn('text-xs font-normal', statusColors[project.status])}
                  >
                    {statusLabels[project.status]}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export to Jupyter</DropdownMenuItem>
                <DropdownMenuItem>Export to Markdown</DropdownMenuItem>
                <DropdownMenuItem>Project Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <div className="border-b border-border px-6">
              <TabsList className="h-12 bg-transparent p-0 -mb-px">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Research Chat
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Overview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
              <ChatInterface conversationId={project.id} />
            </TabsContent>

            <TabsContent value="overview" className="flex-1 overflow-auto mt-0 p-6">
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Score */}
                <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
                  <h2 className="font-semibold mb-4">Project Health</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--neuro-green))"
                          strokeWidth="12"
                          strokeDasharray={`${project.health_score * 2.51} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{project.health_score}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {checklist.map((item, i) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            i < 2 ? 'bg-neuro-green-light' : 'bg-muted'
                          )}>
                            {i < 2 ? (
                              <CheckCircle2 className="w-4 h-4 text-neuro-green" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className={cn(
                            'text-sm',
                            i >= 2 && 'text-muted-foreground'
                          )}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h2 className="font-semibold mb-4">Details</h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="font-medium">{formatDate(project.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Last updated</dt>
                      <dd className="font-medium">{formatDate(project.updated_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <Badge
                          variant="outline"
                          className={cn('text-xs font-normal', statusColors[project.status])}
                        >
                          {statusLabels[project.status]}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Progress */}
                <div className="lg:col-span-3 p-6 rounded-xl border border-border bg-card">
                  <h2 className="font-semibold mb-4">Project Timeline</h2>
                  <div className="flex items-center gap-2">
                    {['ideation', 'data_audit', 'modeling', 'completed'].map((stage, i) => (
                      <div key={stage} className="flex-1">
                        <div className={cn(
                          'h-2 rounded-full',
                          project.status === stage || 
                          ['ideation', 'data_audit', 'modeling', 'completed'].indexOf(project.status) > i
                            ? 'bg-neuro-blue'
                            : 'bg-muted'
                        )} />
                        <p className={cn(
                          'text-xs mt-2',
                          project.status === stage ? 'font-medium' : 'text-muted-foreground'
                        )}>
                          {statusLabels[stage]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
