import { router } from '~/server/api/trpc';
import { getForUser } from './procedures/get-for-user';

export const quotaRouter = router({
  getForUser,
}); 