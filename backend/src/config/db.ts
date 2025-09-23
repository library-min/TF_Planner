import mongoose from "mongoose";

const mongoURI = "mongodb+srv://root:1234@tf01.d2wibc5.mongodb.net/?retryWrites=true&w=majority&appName=TF01";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Atlas 연결 성공");
  } catch (error: any) {
    console.error("❌ MongoDB 연결 실패:", error.message);
    process.exit(1);
  }
};

export default connectDB;
