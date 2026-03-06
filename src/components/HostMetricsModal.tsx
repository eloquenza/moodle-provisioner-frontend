import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cpu, MemoryStick, HardDrive, Activity, Server, Gauge } from "lucide-react";
import { useEffect, useState } from "react";
import type { SystemMetrics } from '../types/metrics';

interface HostMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemMetrics?: SystemMetrics;
}

interface MetricData {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

// Generate mock real-time data
const generateMockData = (): MetricData[] => {
  const now = new Date();
  const data: MetricData[] = [];

  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      cpu: Math.random() * 40 + 30 + Math.sin(i * 0.2) * 20,
      memory: Math.random() * 20 + 50 + Math.sin(i * 0.15) * 15,
      disk: Math.random() * 10 + 25 + Math.sin(i * 0.1) * 5,
    });
  }

  return data;
};

export function HostMetricsModal({ open, onOpenChange, systemMetrics }: HostMetricsModalProps) {
  const [metricsData, setMetricsData] = useState<MetricData[]>(generateMockData());
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: systemMetrics?.cpu.usage || 0,
    memory: systemMetrics?.memory.usage || 0,
    disk: systemMetrics?.disk.usage || 0,
    uptime: "7 days, 14 hours",
    activeContainers: systemMetrics?.activeEnvironments || 8,
    totalContainers: 12
  });

  // Update current metrics when systemMetrics prop changes
  useEffect(() => {
    if (systemMetrics) {
      setCurrentMetrics(prev => ({
        ...prev,
        cpu: systemMetrics.cpu.usage,
        memory: systemMetrics.memory.usage,
        disk: systemMetrics.disk.usage,
        activeContainers: systemMetrics.activeEnvironments
      }));
    }
  }, [systemMetrics]);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setMetricsData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        const latest = {
          time: now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          cpu: systemMetrics?.cpu.usage || (Math.random() * 40 + 30 + Math.sin(Date.now() * 0.0002) * 20),
          memory: systemMetrics?.memory.usage || (Math.random() * 20 + 50 + Math.sin(Date.now() * 0.00015) * 15),
          disk: systemMetrics?.disk.usage || (Math.random() * 10 + 25 + Math.sin(Date.now() * 0.0001) * 5),
        };
        newData.push(latest);

        // Update current metrics
        setCurrentMetrics(prev => ({
          ...prev,
          cpu: latest.cpu,
          memory: latest.memory,
          disk: latest.disk
        }));

        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [open, systemMetrics]);

  const getStatusColor = (value: number, type: 'cpu' | 'memory' | 'disk') => {
    const thresholds = {
      cpu: { warning: 70, critical: 80 },
      memory: { warning: 80, critical: 90 },
      disk: { warning: 85, critical: 95 }
    };

    const threshold = thresholds[type];
    if (value >= threshold.critical) return "destructive";
    if (value >= threshold.warning) return "secondary";
    return "default";
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Host Metrics Dashboard
          </DialogTitle>
          <DialogDescription>
            Real-time monitoring of system resources and container performance
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
          {/* Current Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-info" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {currentMetrics.cpu.toFixed(1)}%
                  </span>
                  <Badge variant={getStatusColor(currentMetrics.cpu, 'cpu')} className="flex-shrink-0">
                    {currentMetrics.cpu >= 80 ? 'Critical' :
                     currentMetrics.cpu >= 70 ? 'Warning' : 'Normal'}
                  </Badge>
                </div>
                <Progress
                  value={currentMetrics.cpu}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-secondary" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {currentMetrics.memory.toFixed(1)}%
                  </span>
                  <Badge variant={getStatusColor(currentMetrics.memory, 'memory')} className="flex-shrink-0">
                    {currentMetrics.memory >= 90 ? 'Critical' :
                     currentMetrics.memory >= 80 ? 'Warning' : 'Normal'}
                  </Badge>
                </div>
                <Progress
                  value={currentMetrics.memory}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {systemMetrics ?
                    `${systemMetrics.memory.used} GB / ${systemMetrics.memory.total} GB` :
                    `${formatBytes(currentMetrics.memory * 0.64)} / ${formatBytes(64)}`
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-success" />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {currentMetrics.disk.toFixed(1)}%
                  </span>
                  <Badge variant={getStatusColor(currentMetrics.disk, 'disk')} className="flex-shrink-0">
                    {currentMetrics.disk >= 95 ? 'Critical' :
                     currentMetrics.disk >= 85 ? 'Warning' : 'Normal'}
                  </Badge>
                </div>
                <Progress
                  value={currentMetrics.disk}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {systemMetrics ?
                    `${systemMetrics.disk.used} GB / ${systemMetrics.disk.total} GB` :
                    `${formatBytes(currentMetrics.disk * 10)} / ${formatBytes(1000)}`
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Containers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      {currentMetrics.activeContainers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-medium">{currentMetrics.totalContainers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-xs">{currentMetrics.uptime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-info" />
                  CPU Usage Over Time
                </CardTitle>
                <CardDescription>Last 30 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'CPU']}
                      />
                      <Line
                        type="monotone"
                        dataKey="cpu"
                        stroke="#17a2b8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Memory Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MemoryStick className="h-5 w-5 text-secondary" />
                  Memory Usage Over Time
                </CardTitle>
                <CardDescription>Last 30 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Memory']}
                      />
                      <Area
                        type="monotone"
                        dataKey="memory"
                        stroke="#ff6f00"
                        fill="#ff6f00"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
