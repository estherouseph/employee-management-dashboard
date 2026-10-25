import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    salary: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

app.get("/", (_req, res) => {
  res.json({
    message: "Employee API is running",
    endpoints: [
      "GET /employees",
      "GET /employees/:id",
      "POST /employees",
      "PUT /employees/:id",
      "DELETE /employees/:id"
    ]
  });
});

app.get("/employees", async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error("GET /employees:", error.message);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

app.get("/employees/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    console.error("GET /employees/:id:", error.message);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
});

app.post("/employees", async (req, res) => {
  try {
    const { name, email = "", designation = "", location = "", salary = 0 } = req.body || {};
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const numericSalary = Number(salary);
    if (!Number.isFinite(numericSalary) || numericSalary < 0) {
      return res.status(400).json({ message: "Salary must be a non-negative number" });
    }
    const employee = await Employee.create({
      name: name.trim(), email, designation, location, salary: numericSalary
    });
    res.status(201).json(employee);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("POST /employees:", error.message);
    res.status(500).json({ message: "Failed to create employee" });
  }
});

app.put("/employees/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const body = req.body || {};
    const updates = {};
    for (const field of ["name", "email", "designation", "location", "salary"]) {
      if (Object.hasOwn(body, field)) updates[field] = body[field];
    }
    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      updates.name = updates.name.trim();
    }
    if (updates.salary !== undefined) {
      updates.salary = Number(updates.salary);
      if (!Number.isFinite(updates.salary) || updates.salary < 0) {
        return res.status(400).json({ message: "Salary must be a non-negative number" });
      }
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("PUT /employees/:id:", error.message);
    res.status(500).json({ message: "Failed to update employee" });
  }
});

app.delete("/employees/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully", employee });
  } catch (error) {
    console.error("DELETE /employees/:id:", error.message);
    res.status(500).json({ message: "Failed to delete employee" });
  }
});

async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Copy .env.example to .env and add your Atlas URI.");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
    return app.listen(PORT, () => console.log(`Employee API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app, Employee, startServer };
export default app;
