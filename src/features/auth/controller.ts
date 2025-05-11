// src/features/auth/presentation/controller.ts

import { type NextFunction, type Request, type Response } from 'express';


export class AuthController {
    constructor() { }

    public login = (_req: Request, res: Response) => {
        res.send("<h1>Login</h1><a href='/api/v1/auth/oidc'>Login with OIDC</a>");
    }

    public logout = (
        _req: Request,
        res: Response,
        _next: NextFunction
    ): void => {
        res.json({ route: "logout" })
    };

    // public oidc = (
    //     _req: Request,
    //     res: Response,
    //     _next: NextFunction
    // ): void => {
    //     //res.json({ route: "oidc" })
    // };

    public profile = (
        _req: Request,
        res: Response,
        _next: NextFunction
    ): void => {
        res.json({ route: "profile" })
    };


    public oidcCallbackHandler(req: Request, res: Response, next: NextFunction) {
        // Optional: Add custom logic after successful authentication.
        // For example, you might want to log user activity or store additional data.
        console.log("OIDC callback was successful");
        res.redirect('/profile'); // or whatever you want to redirect to.
    }

}
