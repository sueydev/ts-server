// src\server.ts

import { type Server as ServerHttp, type IncomingMessage, type ServerResponse } from 'http';
import express, { type Router, type Request, type Response, type NextFunction, RequestHandler } from 'express';
//import compression from 'compression';
import session from 'express-session';
import path from 'path';
import passport from 'passport';
import { Strategy as OpenIDConnectStrategy, VerifyCallback } from 'passport-openidconnect';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import cookieParser from 'cookie-parser';

import { HttpCode, ONE_HUNDRED, ONE_THOUSAND, SIXTY, AppError } from './core';
import { CustomMiddlewares, ErrorMiddleware } from './features/shared';
import ensureAuthenticated from './middlewear/ensure-authenticated';


dotenv.config();

const OIDC_SERVER = process.env.OIDC_SERVER as string;
const CLIENT_SERVER = process.env.CLIENT_SERVER as string;

interface ServerOptions {
	port: number;
	routes: Router;
	apiPrefix: string;
}

export class Server {
	public readonly app = express(); // This is public for testing purposes
	private serverListener?: ServerHttp<typeof IncomingMessage, typeof ServerResponse>;
	private readonly port: number;
	private readonly routes: Router;
	private readonly apiPrefix: string;

	constructor(options: ServerOptions) {
		const { port, routes, apiPrefix } = options;
		this.port = port;
		this.routes = routes;
		this.apiPrefix = apiPrefix;
	}

	async start(): Promise<void> {
		this.app.set('trust proxy', 1);
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true })); // allow x-www-form-urlencoded
		//this.app.use(compression());
		//  limit repeated requests to public APIs
		this.app.use(
			rateLimit({
				max: ONE_HUNDRED,
				windowMs: SIXTY * SIXTY * ONE_THOUSAND,
				message: 'Too many requests from this IP, please try again in one hour'
			})
		);

		// Shared Middlewares
		this.app.use(CustomMiddlewares.writeInConsole);
		this.app.use(cookieParser()); // Parse cookies


		this.app.use(
			session({
			  secret: "canoerace",
			  resave: false,
			  saveUninitialized: false,
			  cookie: { secure: false },
			}) as any
		  );
		  

		this.app.use(passport.initialize() as any);
		this.app.use(passport.session());

		// Passport serialize and deserialize user
		passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
			done(null, user);
		});

		passport.deserializeUser((user: any, done: (err: any, user?: any) => void) => {
			done(null, user);
		});

		// Configure OpenID Connect strategy
		passport.use(
			'oidc',
			new OpenIDConnectStrategy(
				{
					issuer: OIDC_SERVER, // e.g., 'https://your-auth-server.com'
					authorizationURL: `${OIDC_SERVER}/auth`, // e.g., 'https://eeaca54e5621.ngrok.app/authorize'
					tokenURL: `${OIDC_SERVER}/token`, // e.g., 'https://eeaca54e5621.ngrok.app/token'
					userInfoURL: `${OIDC_SERVER}/me`, // e.g., 'https://eeaca54e5621.ngrok.app/userinfo'
					clientID: 'birdsong',
					clientSecret: '12345abcde',
					callbackURL: `${CLIENT_SERVER}/api/v1/auth/oidc`,
					skipUserProfile: false,
					scope: ['openid', 'profile', 'email', 'address'],
				},
				(
					issuer: string,
					profile: any,
					context: object,
					idToken: string | object,
					accessToken: string | object,
					refreshToken: string,
					done: VerifyCallback,
				) => {
					// Here you can process the user profile and save it to your database
					// For this example, we'll just pass the profile through.
					console.log("--issuer--");
					console.log(issuer);
					console.log("--profile--");
					console.log(profile);
					console.log("--context--");
					console.log(context);
					console.log("--idToken--");
					console.log(idToken);
					console.log("--accessToken--");
					console.log(accessToken);
					return done(null, profile);
				})

		);

		//* Routes
		this.app.use(this.apiPrefix, this.routes);

		// Test rest api
		this.app.get('/', (_req: Request, res: Response) => {
			return res.status(HttpCode.OK).send({
				message: `Welcome to Initial API!`
			});
		});

		this.app.use('/docs', ensureAuthenticated, express.static(path.join(__dirname, 'public/docs')));

		//* Handle not found routes in /api/v1/* (only if 'Public content folder' is not available)
		this.routes.all('*', (req: Request, _: Response, next: NextFunction): void => {
			next(AppError.notFound(`Cant find ${req.originalUrl} on this server!`));
		});

		// Handle errors middleware
		this.routes.use(ErrorMiddleware.handleError);

		this.serverListener = this.app.listen(this.port, () => {
			console.log(`Server running on port ${this.port}...`);
		});
	}

	close(): void {
		this.serverListener?.close();
	}
}
