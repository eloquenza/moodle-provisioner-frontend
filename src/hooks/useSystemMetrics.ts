import { useState, useEffect, useCallback } from 'react';
import type { SystemMetrics, SystemAlert, MetricThresholds } from '../types/metrics';
import { defaultThresholds, getAlertSeverity } from '../types/metrics';

// Mock system metrics - in a real application, this would come from your monitoring API
const generateMockMetrics = (): SystemMetrics => {
  try {
    // Simulate realistic but concerning metrics for demo purposes
    const cpuUsage = Math.floor(Math.random() * 20) + 75; // 75-95%
    const memoryUsage = Math.floor(Math.random() * 15) + 85; // 85-100%
    const diskUsage = Math.floor(Math.random() * 30) + 60; // 60-90%
  
    return {
      cpu: {
        usage: cpuUsage,
        cores: 8,
        loadAverage: [2.1, 1.8, 1.9]
      },
      memory: {
        usage: memoryUsage,
        used: Math.round((memoryUsage / 100) * 32 * 100) / 100,
        total: 32,
        available: Math.round(((100 - memoryUsage) / 100) * 32 * 100) / 100
      },
      disk: {
        usage: diskUsage,
        used: Math.round((diskUsage / 100) * 500 * 100) / 100,
        total: 500,
        available: Math.round(((100 - diskUsage) / 100) * 500 * 100) / 100
      },
      network: {
        inbound: Math.random() * 100,
        outbound: Math.random() * 50
      },
      activeEnvironments: Math.floor(Math.random() * 12) + 3,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating mock metrics:', error);
    // Return safe default values
    return {
      cpu: {
        usage: 45,
        cores: 8,
        loadAverage: [1.0, 1.2, 1.1]
      },
      memory: {
        usage: 60,
        used: 19.2,
        total: 32,
        available: 12.8
      },
      disk: {
        usage: 40,
        used: 200,
        total: 500,
        available: 300
      },
      network: {
        inbound: 25,
        outbound: 15
      },
      activeEnvironments: 5,
      lastUpdated: new Date().toISOString()
    };
  }
};

export function useSystemMetrics(environmentCount: number = 0) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [thresholds] = useState<MetricThresholds>(defaultThresholds);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Initialize metrics on mount
  useEffect(() => {
    try {
      const initialMetrics = generateMockMetrics();
      setMetrics(initialMetrics);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to generate initial metrics:', error);
      setIsLoading(false);
    }
  }, []);

  // Generate alerts based on current metrics
  const generateAlerts = useCallback((currentMetrics: SystemMetrics | null): SystemAlert[] => {
    if (!currentMetrics) return [];
    
    try {
      const newAlerts: SystemAlert[] = [];
      const timestamp = new Date().toISOString();

      // CPU alerts
      if (currentMetrics.cpu.usage >= thresholds.cpu.warning) {
      const severity = getAlertSeverity(currentMetrics.cpu.usage, thresholds.cpu);
      newAlerts.push({
        id: 'cpu-usage',
        type: 'cpu',
        severity,
        title: 'High CPU Usage',
        message: severity === 'critical' 
          ? 'CPU usage is critically high. New environment creation has been disabled.'
          : 'CPU usage is elevated. Monitor system performance.',
        metric: {
          current: currentMetrics.cpu.usage,
          threshold: severity === 'critical' ? thresholds.cpu.critical : thresholds.cpu.warning,
          unit: '%'
        },
        timestamp,
        dismissible: severity !== 'critical',
        actionRequired: severity === 'critical',
        preventEnvironmentCreation: severity === 'critical'
      });
      }

      // Memory alerts
      if (currentMetrics.memory.usage >= thresholds.memory.warning) {
      const severity = getAlertSeverity(currentMetrics.memory.usage, thresholds.memory);
      newAlerts.push({
        id: 'memory-usage',
        type: 'memory',
        severity,
        title: 'High Memory Usage',
        message: severity === 'critical'
          ? 'Memory usage is critically high. New environment creation has been disabled.'
          : 'Memory usage is elevated. Consider freeing up resources.',
        metric: {
          current: currentMetrics.memory.usage,
          threshold: severity === 'critical' ? thresholds.memory.critical : thresholds.memory.warning,
          unit: '%'
        },
        timestamp,
        dismissible: severity !== 'critical',
        actionRequired: severity === 'critical',
        preventEnvironmentCreation: severity === 'critical'
      });
      }

      // Disk alerts  
      if (currentMetrics.disk.usage >= thresholds.disk.warning) {
      const severity = getAlertSeverity(currentMetrics.disk.usage, thresholds.disk);
      newAlerts.push({
        id: 'disk-usage',
        type: 'disk',
        severity,
        title: 'High Disk Usage', 
        message: severity === 'critical'
          ? 'Disk usage is critically high. New environment creation has been disabled.'
          : 'Disk usage is elevated. Consider cleaning up unused data.',
        metric: {
          current: currentMetrics.disk.usage,
          threshold: severity === 'critical' ? thresholds.disk.critical : thresholds.disk.warning,
          unit: '%'
        },
        timestamp,
        dismissible: severity !== 'critical',
        actionRequired: severity === 'critical',
        preventEnvironmentCreation: severity === 'critical'
      });
      }

      // Environment limit alerts
      if (environmentCount >= thresholds.maxEnvironments) {
      newAlerts.push({
        id: 'environment-limit',
        type: 'environment_limit',
        severity: 'critical',
        title: 'Environment Limit Reached',
        message: 'Maximum number of environments reached. Delete unused environments to create new ones.',
        metric: {
          current: environmentCount,
          threshold: thresholds.maxEnvironments,
          unit: 'environments'
        },
        timestamp,
        dismissible: false,
        actionRequired: true,
        preventEnvironmentCreation: true
      });
      }

      return newAlerts.filter(alert => !dismissedAlerts.has(alert.id));
    } catch (error) {
      console.error('Error generating alerts:', error);
      return [];
    }
  }, [thresholds, environmentCount, dismissedAlerts]);

  // Fetch metrics (simulated)
  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMetrics = generateMockMetrics();
      setMetrics(newMetrics);
      
      const newAlerts = generateAlerts(newMetrics);
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateAlerts]);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set(prev.add(alertId)));
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Check if environment creation should be prevented
  const canCreateEnvironment = useCallback(() => {
    return !alerts.some(alert => alert.preventEnvironmentCreation);
  }, [alerts]);

  // Get creation prevention reason
  const getCreationPreventionReason = useCallback(() => {
    const blockingAlert = alerts.find(alert => alert.preventEnvironmentCreation);
    return blockingAlert ? blockingAlert.message : null;
  }, [alerts]);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Update alerts when environment count changes
  useEffect(() => {
    if (metrics) {
      const newAlerts = generateAlerts(metrics);
      setAlerts(newAlerts);
    }
  }, [environmentCount, metrics, generateAlerts]);

  return {
    metrics,
    alerts,
    thresholds,
    isLoading,
    fetchMetrics,
    dismissAlert,
    canCreateEnvironment,
    getCreationPreventionReason
  };
}