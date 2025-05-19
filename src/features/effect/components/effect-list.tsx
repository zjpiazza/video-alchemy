'use client';
import { api } from '~/trpc/react';

export function EffectList() {
  const { data, isLoading } = api.effect.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      {data?.map((e) => (
        <div key={e.id}>{e.name}</div>
      ))}
    </div>
  );
} 