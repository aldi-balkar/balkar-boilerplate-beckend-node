import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';
import { AuthRequest } from '../middleware/authenticate';
import { AuditAction } from '@prisma/client';

export class PostController {
  // Get all posts with pagination, filtering, and sorting
  async getPosts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        published,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        isDeleted: false,
        ...(published !== undefined && { published: published === 'true' }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' as const } },
            { content: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }),
        // Non-admin users can only see published posts or their own posts
        ...(req.user?.role !== 'ADMIN' && {
          OR: [{ published: true }, { authorId: req.user?.id }],
        }),
      };

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          skip,
          take: Number(limit),
          select: {
            id: true,
            title: true,
            content: true,
            published: true,
            authorId: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { [sortBy as string]: sortOrder as string },
        }),
        prisma.post.count({ where }),
      ]);

      ResponseHelper.paginated(
        res,
        posts,
        Number(page),
        Number(limit),
        total,
        'Posts retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Get post by ID
  async getPostById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const post = await prisma.post.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: {
          id: true,
          title: true,
          content: true,
          published: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!post) {
        ResponseHelper.notFound(res, 'Post');
        return;
      }

      // Check permissions
      if (
        !post.published &&
        req.user?.role !== 'ADMIN' &&
        post.authorId !== req.user?.id
      ) {
        ResponseHelper.forbidden(res, 'Access denied');
        return;
      }

      ResponseHelper.success(res, ResponseCode.SUCCESS, { post }, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Create new post
  async createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, content, published = false } = req.body;

      const post = await prisma.post.create({
        data: {
          title,
          content,
          published,
          authorId: req.user!.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          published: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.CREATE,
          entity: 'Post',
          entityId: post.id,
          details: `Post created: ${post.title}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.created(res, { post }, 'Post created successfully');
    } catch (error) {
      next(error);
    }
  }

  // Update post
  async updatePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, published } = req.body;

      // Check if post exists
      const existingPost = await prisma.post.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: { id: true, authorId: true, title: true },
      });

      if (!existingPost) {
        ResponseHelper.notFound(res, 'Post');
        return;
      }

      // Check permissions
      if (req.user?.role !== 'ADMIN' && existingPost.authorId !== req.user?.id) {
        ResponseHelper.forbidden(res, 'You can only update your own posts');
        return;
      }

      // Update post
      const post = await prisma.post.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(published !== undefined && { published }),
        },
        select: {
          id: true,
          title: true,
          content: true,
          published: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.UPDATE,
          entity: 'Post',
          entityId: post.id,
          details: `Post updated: ${post.title}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.updated(res, { post }, 'Post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Delete post (soft delete)
  async deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check if post exists
      const post = await prisma.post.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: { id: true, authorId: true, title: true },
      });

      if (!post) {
        ResponseHelper.notFound(res, 'Post');
        return;
      }

      // Check permissions
      if (req.user?.role !== 'ADMIN' && post.authorId !== req.user?.id) {
        ResponseHelper.forbidden(res, 'You can only delete your own posts');
        return;
      }

      // Soft delete
      await prisma.post.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.DELETE,
          entity: 'Post',
          entityId: post.id,
          details: `Post deleted: ${post.title}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.deleted(res, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
