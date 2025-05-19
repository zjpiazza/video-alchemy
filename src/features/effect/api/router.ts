import { router } from '~/server/api/trpc';
import { listEffects } from './procedures/list-effects';

export const effectRouter = router({
  list: listEffects,
}); 