import { Router } from 'express';
import { AuthRoute } from './features/auth/route';

export class AppRoutes {
	static get routes(): Router {
		const router = Router();
		router.use('/auth', AuthRoute.routes);
		console.log('/auth return router')
		return router;
	}
}
