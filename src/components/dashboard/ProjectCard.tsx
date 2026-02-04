import { Link } from 'react-router-dom';
import { Project } from '@/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, ChevronRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="group p-5 rounded-xl border border-border bg-card hover:shadow-elevated transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-muted group-hover:bg-neuro-blue-light transition-colors">
            <FolderKanban className="w-5 h-5 text-muted-foreground group-hover:text-neuro-blue transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{project.title}</h3>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground truncate mb-2">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn('text-xs font-normal', statusColors[project.status])}
              >
                {statusLabels[project.status]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(project.updated_at)}
              </span>
            </div>
          </div>
          {project.health_score > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">{project.health_score}%</div>
              <div className="text-xs text-muted-foreground">Health</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
