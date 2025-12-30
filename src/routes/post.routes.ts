import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate } from '../middleware/authenticate';
import { verifyToken } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema, getPostSchema, deletePostSchema, listPostsSchema } from '../validators/post.validator';
import { crudLimiter } from '../middleware/rateLimiter';

const router = Router();
const postController = new PostController();

// All routes require authentication
router.use(authenticate);

router.get('/', verifyToken('post.list'), crudLimiter, validate(listPostsSchema), postController.getPosts.bind(postController));
router.get('/:id', verifyToken('post.read'), crudLimiter, validate(getPostSchema), postController.getPostById.bind(postController));
router.post('/', verifyToken('post.create'), crudLimiter, validate(createPostSchema), postController.createPost.bind(postController));
router.put('/:id', verifyToken('post.update'), crudLimiter, validate(updatePostSchema), postController.updatePost.bind(postController));
router.delete('/:id', verifyToken('post.delete'), crudLimiter, validate(deletePostSchema), postController.deletePost.bind(postController));

export default router;
