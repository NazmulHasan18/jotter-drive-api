import { TUser } from "../models/User";

declare global {
   namespace Express {
      interface User extends TUser {}

      interface Request {
         user?: User;
      }
   }
}
