import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Manually resolve the path to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./.env") }); 

// Log to confirm it's working before connecting
console.log("Connecting to:", process.env.MONGODB_URI ? "URI found" : "URI STILL UNDEFINED");

// 1. Define the Schema directly here to avoid "Module Not Found" errors
const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    age: Number,
    gender: String,
    condition: String,
    lastVisit: { type: Date, default: Date.now }
});

// Create the model (or use existing one)
const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);

// 2. Change this to your actual MongoDB URL (Check your config/db.js)

const samplePatients = [
    { name: "Maya Krishnan", phone: "9876543210", age: 42, gender: "Female", condition: "Cardiology" },
    { name: "Rajesh Patil", phone: "9123456789", age: 35, gender: "Male", condition: "Orthopedic" },
    { name: "Ananya Iyer", phone: "8877665544", age: 28, gender: "Female", condition: "General" },
    { name: "Vikram Singh", phone: "7766554433", age: 50, gender: "Male", condition: "Neurology" },
    { name: "Sanya Malhotra", phone: "9988776655", age: 31, gender: "Female", condition: "Dermatology" }
];

const seedDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 3. Clear and Insert
        await Patient.deleteMany({});
        console.log("Existing patients cleared.");

        await Patient.insertMany(samplePatients);
        console.log("5 Sample patients added successfully!");

        await mongoose.connection.close();
        console.log("Connection closed.");
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};

seedDB();