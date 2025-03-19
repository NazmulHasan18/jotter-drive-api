import mongoose from "mongoose";
import app from "./app";

async function main() {
   try {
      await mongoose.connect("mongodb://localhost:27017/jotterDrive");

      app.listen(4000, () => {
         console.log(`app is listening on port ${4000}`);
      });
   } catch (err) {
      console.log(err);
   }
}

main();
