// ==================== AI EMPLOYEE PERFORMANCE SYSTEM - BACKEND ====================
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "employeeAI_secret_2026";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.v4fsqcm.mongodb.net/?appName=Cluster0')
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// ====================== SCHEMAS ======================

// Employee Schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    skills: [{ type: String }],
    performanceScore: { type: Number, required: true, min: 0, max: 100 },
    experience: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

// User Schema (HR/Admin)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ====================== AUTH MIDDLEWARE ======================
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// ====================== AUTH ROUTES ======================

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ====================== EMPLOYEE ROUTES ======================

// Add Employee
app.post('/api/employees', authMiddleware, async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json({ message: "Employee added successfully", employee });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get All Employees
app.get('/api/employees', authMiddleware, async (req, res) => {
    try {
        const employees = await Employee.find().sort({ performanceScore: -1 });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search Employee by Department
app.get('/api/employees/search', authMiddleware, async (req, res) => {
    try {
        const { department } = req.query;
        const filter = department ? { department: { $regex: department, $options: 'i' } } : {};
        const employees = await Employee.find(filter);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Employee
app.put('/api/employees/:id', authMiddleware, async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee updated", employee });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Employee
app.delete('/api/employees/:id', authMiddleware, async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Employee deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ====================== AI RECOMMENDATION ROUTE (Improved + Safe) ======================
app.post('/api/ai/recommend', authMiddleware, async (req, res) => {
    try {
        const { employees } = req.body;

        // Basic Validation
        if (!employees || employees.length === 0) {
            return res.status(400).json({ 
                message: "No employees found. Please add some employees first." 
            });
        }

        const prompt = `Act as a senior HR manager and AI talent analyst.
Analyze the following employees and provide detailed recommendations:

${JSON.stringify(employees, null, 2)}

Provide the response in this structured format:
1. **Promotion Recommendations** (Top 3 employees with strong reasons)
2. **Training & Skill Development Suggestions**
3. **Overall Ranking** (Best to Average)
4. **Key Insights & Feedback**`;

        console.log("🤖 Calling OpenRouter AI...");

        const aiResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "openrouter/free",           // Best free model
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://ai-based-employee-performance-analytics.onrender.com',
                    'X-Title': 'AI Employee System'
                }
            }
        );

        // Check if we got valid response
        if (!aiResponse.data?.choices?.[0]?.message?.content) {
            throw new Error("Invalid response from AI service");
        }

        res.json({
            success: true,
            recommendation: aiResponse.data.choices[0].message.content
        });

    } catch (error) {
        console.error("🔴 AI API Full Error:", error.response?.data || error.message);

        let errorMessage = "AI service is currently unavailable";

        // Better Error Messages
        if (error.response?.status === 401) {
            errorMessage = "Invalid OpenRouter API Key";
        } else if (error.response?.status === 429) {
            errorMessage = "Rate limit exceeded. Try again after some time.";
        } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (error.message.includes("API key")) {
            errorMessage = "OpenRouter API Key is missing or invalid";
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            suggestion: "Check your OpenRouter API key in Render Environment Variables"
        });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send("✅ AI Employee Performance Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});