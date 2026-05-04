'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { ExecutionStatus, TaskStatus } from '@cezar12/shared';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PollingResult {
  status: ExecutionStatus | null;
  progress: number;
  result: TaskStatus | null;
  error: string | null;
  isLoading: boolean;
  isCompleted: boolean;
  isFailed: boolean;
}

const POLLING_INTERVAL_MS = 2_000;
const TIMEOUT_MS = 120_000; // 2 minutes

const TERMINAL_STATUSES: ExecutionStatus[] = ['completed', 'failed', 'dead_letter'];

// ═══════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════

export function useTaskPolling(taskId: string | null): PollingResult {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ExecutionStatus | null>(null);
  const [result, setResult] = useState<TaskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!taskId || !isMountedRef.current) return;

    try {
      const taskStatus = await apiGet<TaskStatus>(
        `/services/tasks/${taskId}/status`
      );

      if (!isMountedRef.current) return;

      setStatus(taskStatus.status);
      setResult(taskStatus);

      // Stop if terminal status reached
      if (TERMINAL_STATUSES.includes(taskStatus.status)) {
        stopPolling();
        setIsLoading(false);

        if (taskStatus.status === 'completed') {
          // Invalidate related queries
          await queryClient.invalidateQueries({ queryKey: ['projects'] });
          await queryClient.invalidateQueries({ queryKey: ['token-balance'] });
          await queryClient.invalidateQueries({ queryKey: ['plans'] });
          await queryClient.invalidateQueries({ queryKey: ['contents'] });
        }

        if (taskStatus.status === 'failed' || taskStatus.status === 'dead_letter') {
          setError(taskStatus.error ?? 'حدث خطأ أثناء المعالجة. تم استرداد الـ Tokens.');
          await queryClient.invalidateQueries({ queryKey: ['token-balance'] });
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Polling error:', err);
      // Don't stop on network errors — retry next interval
    }
  }, [taskId, queryClient, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!taskId) {
      setStatus(null);
      setResult(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Start polling immediately
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, POLLING_INTERVAL_MS);

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      stopPolling();
      setIsLoading(false);
      setError('انتهت مهلة الانتظار. الرجاء التحقق من حالة المهمة لاحقاً.');
    }, TIMEOUT_MS);

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [taskId, poll, stopPolling]);

  const isCompleted = status === 'completed';
  const isFailed = status === 'failed' || status === 'dead_letter';

  const progress =
    status === 'queued' ? 10
    : status === 'processing' ? 60
    : status === 'completed' ? 100
    : 0;

  return {
    status,
    progress,
    result,
    error,
    isLoading,
    isCompleted,
    isFailed,
  };
}
