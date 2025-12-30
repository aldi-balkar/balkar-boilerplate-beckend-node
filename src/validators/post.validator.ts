import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().optional().default(false),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid post ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    published: z.boolean().optional(),
  }),
});

export const getPostSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid post ID'),
  }),
});

export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid post ID'),
  }),
});

export const listPostsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().positive().max(100)).optional(),
    published: z.string().transform((val) => val === 'true').pipe(z.boolean()).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
