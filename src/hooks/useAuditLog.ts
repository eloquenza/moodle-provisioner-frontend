import { useState, useCallback } from 'react';
import type { AuditLogEntry, AuditAction, AuditResource, getActionSeverity } from '../types/audit';
import { getActionSeverity as calculateSeverity } from '../types/audit';

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: '2024-01-15T14:30:00Z',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@moodle.org',
    action: 'create',
    resource: 'environment',
    resourceId: 'env-1',
    resourceName: 'quiz-testing-dev',
    details: {
      plugin: 'mod_quiz',
      version: 'develop',
      moodleVersion: '4.3.0'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    severity: 'medium'
  },
  {
    id: 'audit-2', 
    timestamp: '2024-01-15T13:45:00Z',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@moodle.org',
    action: 'copy_password',
    resource: 'environment',
    resourceId: 'env-2',
    resourceName: 'forum-bugfix',
    details: {
      passwordCopied: true
    },
    ipAddress: '192.168.1.101',
    severity: 'medium'
  },
  {
    id: 'audit-3',
    timestamp: '2024-01-15T12:20:00Z', 
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@moodle.org',
    action: 'delete',
    resource: 'environment',
    resourceId: 'env-old-1',
    resourceName: 'old-test-env',
    details: {
      reason: 'Cleanup old test environments'
    },
    ipAddress: '192.168.1.100',
    severity: 'high'
  },
  {
    id: 'audit-4',
    timestamp: '2024-01-15T11:10:00Z',
    userId: 'user-1', 
    userName: 'John Doe',
    userEmail: 'john.doe@moodle.org',
    action: 'create',
    resource: 'user',
    resourceId: 'user-2',
    resourceName: 'Jane Smith',
    details: {
      email: 'jane.smith@moodle.org',
      roles: ['tester']
    },
    ipAddress: '192.168.1.100',
    severity: 'medium'
  },
  {
    id: 'audit-5',
    timestamp: '2024-01-15T10:30:00Z',
    userId: 'user-2',
    userName: 'Jane Smith', 
    userEmail: 'jane.smith@moodle.org',
    action: 'login',
    resource: 'system',
    details: {
      loginMethod: 'email',
      sessionId: 'sess-123'
    },
    ipAddress: '192.168.1.101',
    severity: 'low'
  },
  {
    id: 'audit-6',
    timestamp: '2024-01-15T09:15:00Z',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@moodle.org',
    action: 'stop',
    resource: 'environment', 
    resourceId: 'env-3',
    resourceName: 'theme-preview',
    details: {
      previousStatus: 'running',
      reason: 'Maintenance'
    },
    ipAddress: '192.168.1.100',
    severity: 'medium'
  }
];

export function useAuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);

  const logActivity = useCallback((
    userId: string,
    userName: string,
    userEmail: string,
    action: AuditAction,
    resource: AuditResource,
    details: Record<string, any> = {},
    resourceId?: string,
    resourceName?: string
  ) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userEmail,
      action,
      resource,
      resourceId,
      resourceName,
      details,
      ipAddress: '192.168.1.100', // Mock IP - in real app would get from request
      userAgent: navigator.userAgent,
      severity: calculateSeverity(action, resource)
    };

    setAuditLogs(prev => [entry, ...prev]);
    return entry;
  }, []);

  const getFilteredLogs = useCallback((
    filters: {
      dateRange?: { from: string; to: string };
      users?: string[];
      actions?: AuditAction[];
      resources?: AuditResource[];
      severity?: ('low' | 'medium' | 'high' | 'critical')[];
      searchQuery?: string;
    } = {}
  ) => {
    return auditLogs.filter(log => {
      // Date range filter
      if (filters.dateRange) {
        const logDate = new Date(log.timestamp);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        if (logDate < fromDate || logDate > toDate) return false;
      }

      // Users filter
      if (filters.users && filters.users.length > 0) {
        if (!filters.users.includes(log.userId)) return false;
      }

      // Actions filter  
      if (filters.actions && filters.actions.length > 0) {
        if (!filters.actions.includes(log.action)) return false;
      }

      // Resources filter
      if (filters.resources && filters.resources.length > 0) {
        if (!filters.resources.includes(log.resource)) return false;
      }

      // Severity filter
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(log.severity)) return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          log.userName.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.resource.toLowerCase().includes(query) ||
          (log.resourceName && log.resourceName.toLowerCase().includes(query)) ||
          JSON.stringify(log.details).toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [auditLogs]);

  const getLogsByUser = useCallback((userId: string) => {
    return auditLogs.filter(log => log.userId === userId);
  }, [auditLogs]);

  const getLogsByResource = useCallback((resource: AuditResource, resourceId?: string) => {
    return auditLogs.filter(log => {
      if (log.resource !== resource) return false;
      if (resourceId && log.resourceId !== resourceId) return false;
      return true;
    });
  }, [auditLogs]);

  const exportLogs = useCallback((logs: AuditLogEntry[]) => {
    const csv = [
      'Timestamp,User,Action,Resource,Resource Name,Details,IP Address,Severity',
      ...logs.map(log => [
        log.timestamp,
        `"${log.userName} (${log.userEmail})"`,
        log.action,
        log.resource,
        `"${log.resourceName || ''}"`,
        `"${JSON.stringify(log.details)}"`,
        log.ipAddress || '',
        log.severity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    auditLogs,
    logActivity,
    getFilteredLogs,
    getLogsByUser,
    getLogsByResource,
    exportLogs
  };
}