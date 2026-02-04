import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ResearchPage() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-xl font-semibold">Research Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Chat with NeuroGuide about ML topics, papers, and code
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </DashboardLayout>
  );
}
