import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import config from "../config";
import User, { TUser } from "../models/User";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         throw new AppError(401, "Unauthorized: No token provided");
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, config.jwt_secret as string) as JwtPayload;

      const { user: payloadData } = decoded as JwtPayload;

      const user = await User.findById(payloadData?._id);

      if (!user || user.loggedOut) {
         throw new AppError(401, "Unauthorized: User not found");
      }

      if (decoded?.iat && new Date(user?.passChangeAt as Date).getTime() / 1000 > decoded.iat) {
         throw new AppError(401, "User not authorized");
      }

      req.user = user as TUser;
      next();
   } catch (error) {
      next(error);
   }
};

export default authenticate;
