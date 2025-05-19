'use client';
import { api } from '~/trpc/react';

export function UserSettingsPanel() {
  // Placeholder: update to correct procedure when implemented
  const { data, isLoading } = api.userSettings?.getAll?.useQuery?.() || { data: null, isLoading: false };

  if (isLoading) return <div>Loading...</div>;
  return <div>User Settings Panel (placeholder) {JSON.stringify(data)}</div>;
} 