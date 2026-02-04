import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Database, Code, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'Multi-Agent AI System',
      description: 'Specialized agents collaborate to help with research, data auditing, and code generation.',
    },
    {
      icon: Database,
      title: 'Dataset Auditing',
      description: 'Automatically detect class imbalance, data leakage, missing values, and outliers.',
    },
    {
      icon: BookOpen,
      title: 'Research Paper Search',
      description: 'Search across Semantic Scholar, ArXiv, and Papers with Code.',
    },
    {
      icon: Code,
      title: 'Code Generation',
      description: 'Generate production-ready ML code with safety checks and best practices.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">NeuroGuide</span>
          </div>
          
          {!loading && (
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign in</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Get started</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neuro-blue-light text-neuro-blue text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Research Companion
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your intelligent companion for{' '}
            <span className="gradient-text">ML research</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            NeuroGuide uses a multi-agent AI system to help you audit datasets, 
            explore research papers, generate code, and accelerate your machine learning projects.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for ML research
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-elevated transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-neuro-blue-light flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-neuro-blue" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to accelerate your research?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join researchers and ML practitioners using NeuroGuide to build better models.
          </p>
          <Link to="/signup">
            <Button size="lg">
              Get started for free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-medium">NeuroGuide</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NeuroGuide. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
