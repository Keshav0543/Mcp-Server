import mongoose from "mongoose";

const main = async () => {
  try {
    await mongoose.connect("3csxeis-shard-00-00.0ysv0vg.mongodb.net:27017,ac-3csxeis-shard-00-01.0ysv0vg.mongodb.net:27017,ac-3csxeis-shard-00-02.0ysv0vg.mongodb.net:27017/TodoList?ssl=true&replicaSet=atlas-5bi3ei-shard-0&authSource=admin&appName=Cluster0", {
      serverSelectionTimeoutMS: 10000
    });

    console.log(
      "MongoDB connected:",
      mongoose.connection.name
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default main;
