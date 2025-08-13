import mongoose, { mongo } from "mongoose";

//Function to connect to the mongodb database
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connnected")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
    console.log(error);
  }
};
