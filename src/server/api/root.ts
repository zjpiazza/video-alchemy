import { router } from './trpc';
import { effectRouter } from '~/features/effect/api/router';
import { transformationRouter } from '~/features/transformation/api/router';
import { quotaRouter } from '~/features/quota/api/router';

export const appRouter = router({
  effect: effectRouter,
  transformation: transformationRouter,
  quota: quotaRouter,
});

export type AppRouter = typeof appRouter; 