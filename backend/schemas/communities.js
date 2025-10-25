import { z } from 'zod';

export const CommId = z.string().uuid();

export const CommUserPair = z.object({
  community_id: z.string().uuid(),
  user_id: z.string().uuid()
});

export const NewCommunity = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  location_name: z.string().min(1).max(255),
  created_by: z.string().uuid().optional()
});