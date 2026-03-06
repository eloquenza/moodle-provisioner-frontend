import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, Circle, AlertCircle, Loader2 } from "lucide-react";
// Removed date-fns import as it's not needed for this implementation

export interface ProvisioningStep {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  estimatedDuration: number; // in milliseconds
}

export interface ProvisioningTimeline {
  environmentId: string;
  environmentName: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  currentStep?: string;
  steps: ProvisioningStep[];
}

interface ProvisioningTimelineModalProps {
  timeline: ProvisioningTimeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const provisioningSteps: Omit<ProvisioningStep, "status" | "startTime" | "endTime" | "duration">[] = [
  {
    id: "01_RESERVE_NAME",
    name: "01_RESERVE_NAME",
    displayName: "Reserve Name",
    description: "Reserve the environment name and check for conflicts",
    estimatedDuration: 2000
  },
  {
    id: "02_PREP_DIRS",
    name: "02_PREP_DIRS",
    displayName: "Prepare Directories",
    description: "Create and set up the directory structure for the environment",
    estimatedDuration: 3000
  },
  {
    id: "03_RESOLVE_STACK",
    name: "03_RESOLVE_STACK",
    displayName: "Resolve Stack Configuration",
    description: "Process YAML configurations and resolve dependencies",
    estimatedDuration: 5000
  },
  {
    id: "04_RENDER_COMPOSE",
    name: "04_RENDER_COMPOSE",
    displayName: "Render Docker Compose",
    description: "Generate docker-compose.yml and environment files",
    estimatedDuration: 4000
  },
  {
    id: "05_DOCKER_CREATE",
    name: "05_DOCKER_CREATE",
    displayName: "Create Docker Containers",
    description: "Run docker-compose up --no-start to create containers",
    estimatedDuration: 15000
  },
  {
    id: "06_DOCKER_START",
    name: "06_DOCKER_START",
    displayName: "Start Docker Containers",
    description: "Start all containers and wait for health checks",
    estimatedDuration: 20000
  },
  {
    id: "07_INIT_MOODLE",
    name: "07_INIT_MOODLE",
    displayName: "Initialize Moodle",
    description: "Run Moodle initialization scripts and create admin user",
    estimatedDuration: 30000
  },
  {
    id: "08_NGINX_WRITE",
    name: "08_NGINX_WRITE",
    displayName: "Configure Nginx",
    description: "Write nginx site configuration and create symbolic links",
    estimatedDuration: 2000
  },
  {
    id: "09_NGINX_RELOAD",
    name: "09_NGINX_RELOAD",
    displayName: "Reload Nginx",
    description: "Reload nginx configuration to enable the new site",
    estimatedDuration: 1000
  },
  {
    id: "10_FINALIZE",
    name: "10_FINALIZE",
    displayName: "Finalize Environment",
    description: "Complete setup and mark environment as ready",
    estimatedDuration: 2000
  }
];

export function ProvisioningTimelineModal({ timeline, open, onOpenChange }: ProvisioningTimelineModalProps) {
  if (!timeline) return null;

  const getStepIcon = (step: ProvisioningStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-info animate-spin" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepBadge = (step: ProvisioningStep) => {
    switch (step.status) {
      case "completed":
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      case "running":
        return <Badge variant="outline" className="border-info text-info bg-info/10">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getTotalProgress = () => {
    const completedSteps = timeline.steps.filter(step => step.status === "completed").length;
    return (completedSteps / timeline.steps.length) * 100;
  };

  const getEstimatedTimeRemaining = () => {
    const remainingSteps = timeline.steps.filter(step => step.status === "pending");
    const totalEstimated = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
    return totalEstimated;
  };

  const getElapsedTime = () => {
    const now = timeline.endTime || new Date();
    return now.getTime() - timeline.startTime.getTime();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Clock className="h-5 w-5" />
            Provisioning Timeline - {timeline.environmentName}
          </DialogTitle>
          <DialogDescription>
            Track the progress of environment creation in real-time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Progress Overview */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{Math.round(getTotalProgress())}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getTotalProgress()}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="text-xs text-muted-foreground">Started</div>
                  <div className="text-sm font-medium">
                    {timeline.startTime.toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Elapsed Time</div>
                  <div className="text-sm font-medium">
                    {formatDuration(getElapsedTime())}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Est. Remaining</div>
                  <div className="text-sm font-medium">
                    {timeline.status === "completed" ? "Complete" : formatDuration(getEstimatedTimeRemaining())}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps Timeline */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Provisioning Steps</CardTitle>
              <CardDescription>Detailed progress of each step</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  {timeline.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                      <div className="flex-shrink-0 mt-1">
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{step.displayName}</h4>
                            <code className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                              {step.name}
                            </code>
                          </div>
                          {getStepBadge(step)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          {step.startTime && (
                            <div>
                              <span className="font-medium">Started:</span> {step.startTime.toLocaleTimeString()}
                            </div>
                          )}
                          {step.endTime && (
                            <div>
                              <span className="font-medium">Completed:</span> {step.endTime.toLocaleTimeString()}
                            </div>
                          )}
                          {step.duration && (
                            <div>
                              <span className="font-medium">Duration:</span> {formatDuration(step.duration)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Estimated:</span> {formatDuration(step.estimatedDuration)}
                          </div>
                        </div>
                        {step.status === "running" && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>Running...</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1">
                              <div className="bg-info h-1 rounded-full animate-pulse w-3/4" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { provisioningSteps };
