export interface SystemMetrics {
  cpu: {
    usage: number; // Percentage (0-100)
    cores: number;
    loadAverage: number[];
  };
  memory: {
    usage: number; // Percentage (0-100)
    used: number; // GB
    total: number; // GB
    available: number; // GB
  };
  disk: {
    usage: number; // Percentage (0-100)
    used: number; // GB
    total: number; // GB
    available: number; // GB
  };
  network: {
    inbound: number; // MB/s
    outbound: number; // MB/s
  };
  activeEnvironments: number;
  lastUpdated: string;
}

export interface SystemAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'environment_limit' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  metric?: {
    current: number;
    threshold: number;
    unit: string;
  };
  timestamp: string;
  dismissible: boolean;
  actionRequired: boolean;
  preventEnvironmentCreation: boolean;
}

export interface MetricThresholds {
  cpu: {
    warning: number; // 70%
    critical: number; // 80%
  };
  memory: {
    warning: number; // 80%
    critical: number; // 90%
  };
  disk: {
    warning: number; // 85%
    critical: number; // 95%
  };
  maxEnvironments: number;
}

export const defaultThresholds: MetricThresholds = {
  cpu: {
    warning: 70,
    critical: 80
  },
  memory: {
    warning: 80,
    critical: 90
  },
  disk: {
    warning: 85,
    critical: 95
  },
  maxEnvironments: 10
};

export const getAlertSeverity = (metric: number, thresholds: { warning: number; critical: number }): SystemAlert['severity'] => {
  if (metric >= thresholds.critical) return 'critical';
  if (metric >= thresholds.warning) return 'error';
  return 'info';
};

export const shouldPreventEnvironmentCreation = (alerts: SystemAlert[]): boolean => {
  return alerts.some(alert => alert.preventEnvironmentCreation && alert.severity === 'critical');
};