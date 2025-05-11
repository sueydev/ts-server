import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
const JWT_SEED = process.env.JWT_SEED as string;

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.docs;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SEED);
    console.log('Read JWT from cookie')
    console.log(decoded);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.redirect('/login'); // Redirect if token is invalid/expired
  }
};

export default ensureAuthenticated;