'use client';
import { api } from '~/trpc/react';

export function QuotaUsage() {
  // Placeholder: update to correct procedure when implemented
  const { data, isLoading } = api.quota?.getAll?.useQuery?.() || { data: null, isLoading: false };

  if (isLoading) return <div>Loading...</div>;
  return <div>Quota Usage (placeholder) {JSON.stringify(data)}</div>;
} 