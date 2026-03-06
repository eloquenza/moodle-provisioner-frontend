import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Server,
  Refresh
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { SystemAlert } from "../types/metrics";

interface SystemBannerProps {
  alerts: SystemAlert[];
  onDismissAlert: (alertId: string) => void;
  onRefreshMetrics: () => void;
  isLoading?: boolean;
}

export function SystemBanner({ alerts, onDismissAlert, onRefreshMetrics, isLoading = false }: SystemBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  // Sort alerts by severity (critical first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 };
    return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
  });

  const getAlertIcon = (type: SystemAlert['type'], severity: SystemAlert['severity']) => {
    const baseClass = "h-4 w-4";
    const colorClass = severity === 'critical' ? "text-destructive" : 
                     severity === 'error' ? "text-warning" :
                     severity === 'warning' ? "text-secondary" : "text-info";

    switch (type) {
      case 'cpu': return <Cpu className={`${baseClass} ${colorClass}`} />;
      case 'memory': return <MemoryStick className={`${baseClass} ${colorClass}`} />;
      case 'disk': return <HardDrive className={`${baseClass} ${colorClass}`} />;
      case 'environment_limit': return <Server className={`${baseClass} ${colorClass}`} />;
      default: return <Activity className={`${baseClass} ${colorClass}`} />;
    }
  };

  const getAlertVariant = (severity: SystemAlert['severity']): "default" | "destructive" => {
    return severity === 'critical' ? "destructive" : "default";
  };

  const getSeverityColor = (severity: SystemAlert['severity']): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'secondary';
      case 'warning': return 'default';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence mode="popLayout">
        {sortedAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="shadow-lg"
          >
            <Alert 
              variant={getAlertVariant(alert.severity)}
              className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-destructive bg-destructive/5' :
                alert.severity === 'error' ? 'border-l-warning bg-warning/5' :
                alert.severity === 'warning' ? 'border-l-secondary bg-secondary/5' :
                'border-l-info bg-info/5'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start space-x-3 flex-1">
                  {getAlertIcon(alert.type, alert.severity)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTitle className="mb-0">{alert.title}</AlertTitle>
                      <Badge 
                        variant={getSeverityColor(alert.severity)}
                        className="text-xs capitalize"
                      >
                        {alert.severity}
                      </Badge>
                      {alert.actionRequired && (
                        <Badge variant="outline" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                    </div>
                    
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>

                    {alert.metric && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Current: {alert.metric.current || 0}{alert.metric.unit || ''}</span>
                          <span>Threshold: {alert.metric.threshold || 0}{alert.metric.unit || ''}</span>
                        </div>
                        <Progress 
                          value={Math.min(Math.max(alert.metric.current || 0, 0), 100)} 
                          max={100}
                          className={`h-2 ${
                            alert.severity === 'critical' ? '[&>div]:bg-destructive' :
                            alert.severity === 'error' ? '[&>div]:bg-warning' :
                            alert.severity === 'warning' ? '[&>div]:bg-secondary' :
                            '[&>div]:bg-info'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {alert.type !== 'environment_limit' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRefreshMetrics}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                      title="Refresh metrics"
                    >
                      <Refresh className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  
                  {alert.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissAlert(alert.id)}
                      className="h-8 w-8 p-0"
                      title="Dismiss alert"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Summary for multiple critical alerts */}
      {sortedAlerts.filter(a => a.severity === 'critical').length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Multiple critical issues detected - Environment creation is disabled
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}