import express, { Router } from 'express';
import path from 'path';

class Docs {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Serve static files from "public/docs"
    this.router.use('/', express.static(path.resolve(__dirname, '../public/docs')));
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default new Docs().getRouter();