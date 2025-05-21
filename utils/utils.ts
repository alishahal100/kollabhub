// import { NextFunction, Request, Response } from 'express';
// import { ZodError } from 'zod';
// import { z } from 'zod';

// export const asyncHandler = (fn: Function) => 
//   (req: Request, res: Response, next: NextFunction) => 
//     Promise.resolve(fn(req, res, next)).catch(next);

// export const validateRequest = (schema: z.ZodSchema) => 
//   (req: Request, res: Response, next: NextFunction) => {
//     try {
//       schema.parse(req.body);
//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({ errors: error.errors });
//       } else {
//         next(error);
//       }
//     }
//   };