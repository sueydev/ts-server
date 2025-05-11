
import { Router, RequestHandler } from 'express';
import { AuthController } from './controller';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
const JWT_SEED = process.env.JWT_SEED as string;


export class AuthRoute {
	static get routes(): Router {
		const router = Router();
		const controller = new AuthController();
		router.get('/login', controller.login as RequestHandler);
		router.get('/logout', controller.logout as RequestHandler);
		router.get('/profile', controller.profile as RequestHandler);
		//router.get('/profile', docs);


		//app.use('/docs', express.static(path.join(__dirname, 'public/docs')));


		//router.get('/oidc', passport.authenticate('oidc')); //passport.authenticate('oidc')
		// router.get('/oidc', passport.authenticate('oidc', {
		// 	successRedirect: '/profile',
		// 	failureRedirect: '/login', // Or any error handling route
		// }));

		// router.get('/oidc', passport.authenticate('oidc', {
		// 	successRedirect: '/profile',
		// 	failureRedirect: '/login',
		//   }), controller.oidcCallbackHandler as RequestHandler);


		router.get('/oidc', (req, res, next) => {
			passport.authenticate('oidc', { session: false }, (err, user) => {
				if (err || !user) {
					return res.redirect('/login');
				}

				// Generate a JWT token
				console.log('Generate a JWT token')
				console.log({ id: user.id, email: user.email });
				const token = jwt.sign({ id: user.id, email: user.email }, JWT_SEED, { expiresIn: '1h' });

				// Store token in HTTP-only cookie
				res.cookie('docs', token, {
					httpOnly: true,  // Prevent access via JavaScript
					secure: process.env.NODE_ENV === 'production', // Secure in production
					maxAge: 3600000  // 1 hour expiry
				});

				return res.redirect('/docs');
			})(req, res, next);
		});

		return router;
	}
}