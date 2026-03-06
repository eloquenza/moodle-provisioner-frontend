import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Copy, ExternalLink, Eye, FileText, Pin, PinOff, GitPullRequest, Container, Database, Cpu, Network, Play, Square } from "lucide-react";
import { toast } from "sonner";
import type { Environment, MoodleContainer } from "./EnvironmentsTable";

export interface DetailedEnvironment extends Environment {
  updatedAt: string;
  logs: string[];
  dockerLinks: {
    container: string;
    logs: string;
    exec: string;
  };
}

interface EnvironmentDetailsModalProps {
  environment: DetailedEnvironment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogActivity?: (action: string, resource: string, details: Record<string, any>, resourceId?: string, resourceName?: string) => void;
  onTogglePin?: (environmentId: string) => void;
  onStartContainer?: (environmentId: string, containerId: string) => void;
  onStopContainer?: (environmentId: string, containerId: string) => void;
}

export function EnvironmentDetailsModal({
  environment,
  open,
  onOpenChange,
  onLogActivity,
  onTogglePin,
  onStartContainer,
  onStopContainer
}: EnvironmentDetailsModalProps) {
  if (!environment) return null;

  const copyToClipboard = async (text: string, label: string, containerId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);

      // Log password copy activity
      if (label.toLowerCase().includes('password') && environment && onLogActivity) {
        onLogActivity('copy_password', containerId ? 'container' : 'environment', { passwordCopied: true }, containerId || environment.id, environment.name);
      }
    } catch (err) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const getContainerStatusBadge = (status: MoodleContainer['status']) => {
    switch (status) {
      case "running":
        return { variant: "default" as const, className: "bg-success text-success-foreground" };
      case "stopped":
        return { variant: "secondary" as const, className: "bg-muted text-muted-foreground" };
      case "starting":
        return { variant: "outline" as const, className: "border-info text-info bg-info/10" };
      case "stopping":
        return { variant: "outline" as const, className: "border-warning text-warning bg-warning/10" };
      case "provisioning":
        return { variant: "outline" as const, className: "border-secondary text-secondary bg-secondary/10" };
      default:
        return { variant: "secondary" as const, className: "bg-muted text-muted-foreground" };
    }
  };

  const getEnvironmentStatus = () => {
    const containers = environment.containers;
    if (containers.length === 0) return "no-containers";

    const runningContainers = containers.filter(c => c.status === "running").length;
    const provisioningContainers = containers.filter(c => c.status === "provisioning").length;
    const totalContainers = containers.length;

    if (provisioningContainers > 0) return "provisioning";
    if (runningContainers === totalContainers) return "running";
    if (runningContainers === 0) return "stopped";
    return "mixed";
  };

  const getEnvironmentStatusBadge = () => {
    const status = getEnvironmentStatus();
    switch (status) {
      case "running":
        return { variant: "default" as const, className: "bg-success text-success-foreground" };
      case "stopped":
        return { variant: "secondary" as const, className: "bg-muted text-muted-foreground" };
      case "mixed":
        return { variant: "outline" as const, className: "border-warning text-warning bg-warning/10" };
      case "provisioning":
        return { variant: "outline" as const, className: "border-secondary text-secondary bg-secondary/10" };
      case "no-containers":
        return { variant: "outline" as const, className: "border-muted text-muted-foreground bg-muted/10" };
      default:
        return { variant: "secondary" as const, className: "bg-muted text-muted-foreground" };
    }
  };

  const envStatusBadge = getEnvironmentStatusBadge();
  const envStatus = getEnvironmentStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3">
                {environment.name}
                {environment.isPinned && (
                  <Pin className="h-4 w-4 text-warning fill-warning" />
                )}
                <Badge variant={envStatusBadge.variant} className={envStatusBadge.className}>
                  {envStatus === "no-containers" ? "No containers" :
                   envStatus === "mixed" ? `Mixed (${environment.containers.filter(c => c.status === 'running').length}/${environment.containers.length} running)` :
                   envStatus}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Detailed information for test environment with {environment.containers.length} container{environment.containers.length !== 1 ? 's' : ''}
                {environment.isPinned && " • This environment is pinned and protected from auto-eviction"}
              </DialogDescription>
            </div>
            {onTogglePin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTogglePin(environment.id)}
                className={environment.isPinned ? "border-warning text-warning hover:bg-warning/10" : ""}
              >
                {environment.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin Environment
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Environment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Plugin</dt>
                    <dd className="font-medium">{environment.plugin}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Version</dt>
                    <dd>
                      {environment.isWebhookCreated && environment.pullRequestUrl ? (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-info hover:text-info/80 underline decoration-1 underline-offset-2 hover:decoration-2"
                          onClick={() => window.open(environment.pullRequestUrl, '_blank')}
                        >
                          <GitPullRequest className="h-3 w-3 mr-1" />
                          <code className="text-info">
                            PR #{environment.pullRequestNumber}
                          </code>
                        </Button>
                      ) : (
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {environment.version}
                        </code>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Containers</dt>
                    <dd className="font-medium">{environment.containers.length} container{environment.containers.length !== 1 ? 's' : ''}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Overall Status</dt>
                    <dd>
                      <Badge variant={envStatusBadge.variant} className={envStatusBadge.className}>
                        {envStatus === "no-containers" ? "No containers" :
                         envStatus === "mixed" ? `Mixed (${environment.containers.filter(c => c.status === 'running').length}/${environment.containers.length} running)` :
                         envStatus}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Created</dt>
                    <dd className="text-sm">{environment.createdAt}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Last Updated</dt>
                    <dd className="text-sm">{environment.updatedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Creation Source</dt>
                    <dd className="text-sm">
                      <div className="flex items-center gap-2">
                        {environment.isWebhookCreated ? (
                          <>
                            <GitPullRequest className="h-4 w-4 text-info" />
                            <span className="font-medium text-info">GitHub Webhook</span>
                            {environment.pullRequestUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-info hover:text-info/80 text-xs"
                                onClick={() => window.open(environment.pullRequestUrl, '_blank')}
                              >
                                View PR #{environment.pullRequestNumber}
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="font-medium">Manual Creation</span>
                          </>
                        )}
                      </div>
                    </dd>
                  </div>
                  {environment.createdBy && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Created By</dt>
                      <dd className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{environment.createdBy.name}</span>
                          <span className="text-muted-foreground">({environment.createdBy.email})</span>
                        </div>
                      </dd>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Environment Management */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Environment Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Pin className={`h-4 w-4 ${environment.isPinned ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                      <span className="font-medium">
                        {environment.isPinned ? 'Environment Pinned' : 'Environment Not Pinned'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {environment.isPinned
                        ? 'This environment is protected from automatic shutdown and deletion due to inactivity.'
                        : 'This environment may be automatically shut down or deleted based on system policies for resource management.'
                      }
                    </p>
                  </div>
                  {onTogglePin && (
                    <Button
                      variant={environment.isPinned ? "outline" : "default"}
                      size="sm"
                      onClick={() => onTogglePin(environment.id)}
                      className={environment.isPinned ? "border-warning text-warning hover:bg-warning/10" : "bg-warning hover:bg-warning/90 text-warning-foreground"}
                    >
                      {environment.isPinned ? (
                        <>
                          <PinOff className="h-4 w-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Containers */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Moodle Containers</CardTitle>
                <CardDescription>
                  Individual Moodle instances running for this environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {environment.containers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Container className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No containers created yet.</p>
                    <p className="text-sm">Use "Add Container" to create your first Moodle instance.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {environment.containers.map((container) => {
                      const containerStatusBadge = getContainerStatusBadge(container.status);
                      return (
                        <div key={container.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Container className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="font-medium">Moodle {container.moodleVersion}</h4>
                                <p className="text-sm text-muted-foreground">Created {container.createdAt}</p>
                              </div>
                              {container.advancedConfig && (
                                <div className="flex items-center gap-2 ml-4">
                                  <Database className="h-4 w-4 text-muted-foreground" title={`Database: ${container.advancedConfig.database}`} />
                                  <span className="text-xs text-muted-foreground">{container.advancedConfig.database}</span>
                                  <Cpu className="h-4 w-4 text-muted-foreground" title={`PHP: ${container.advancedConfig.phpVersion}`} />
                                  <span className="text-xs text-muted-foreground">PHP {container.advancedConfig.phpVersion}</span>
                                  {container.advancedConfig.enableMLBackend && (
                                    <div className="flex items-center gap-1">
                                      <Network className="h-4 w-4 text-info" title="MLBackend enabled" />
                                      <span className="text-xs text-info">MLBackend</span>
                                    </div>
                                  )}
                                  {container.advancedConfig.additionalPlugins.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{container.advancedConfig.additionalPlugins.length} plugins
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={containerStatusBadge.variant}
                                className={containerStatusBadge.className}
                              >
                                {container.status}
                              </Badge>
                              {onStartContainer && onStopContainer && (
                                <>
                                  {container.status === "stopped" ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => onStartContainer(environment.id, container.id)}
                                      disabled={container.status === "starting" || container.status === "provisioning"}
                                      className="border-success text-success hover:bg-success hover:text-success-foreground"
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => onStopContainer(environment.id, container.id)}
                                      disabled={container.status === "stopping" || container.status === "provisioning"}
                                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                      <Square className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <dt className="text-sm text-muted-foreground mb-1">Container URL</dt>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-2 py-1 bg-muted rounded text-sm text-xs">
                                  {container.url}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(container.url, '_blank')}
                                  disabled={container.status !== "running"}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <dt className="text-sm text-muted-foreground mb-1">Admin Password</dt>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-2 py-1 bg-muted rounded text-sm text-xs font-mono">
                                  {container.adminPassword}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(container.adminPassword, "Admin password", container.id)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {container.advancedConfig && container.advancedConfig.additionalPlugins.length > 0 && (
                            <div>
                              <dt className="text-sm text-muted-foreground mb-1">Additional Plugins</dt>
                              <div className="flex flex-wrap gap-1">
                                {container.advancedConfig.additionalPlugins.map((plugin, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {plugin}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
