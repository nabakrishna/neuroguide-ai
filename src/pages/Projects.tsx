import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderKanban, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, loading, createProject } = useProjects();
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newProject.title.trim()) return;
    
    setIsCreating(true);
    const project = await createProject(newProject.title, newProject.description);
    setIsCreating(false);
    setDialogOpen(false);
    setNewProject({ title: '', description: '' });
    
    if (project) {
      navigate(`/projects/${project.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage your ML research projects
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new ML research project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project name</Label>
                  <Input
                    id="title"
                    placeholder="My ML Project"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What are you building?"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!newProject.title.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects match your search</p>
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first ML project to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
