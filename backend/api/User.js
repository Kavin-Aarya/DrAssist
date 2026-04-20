import { User, Recording, Patient, Prescription, Template } from "../models/User.js";
import bcrypt from "bcrypt";
import auth from "../middleware/auth.js";
import 'dotenv/config';
import fs from 'fs';

const nameRegex     = /^[a-zA-Z .]*$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex    = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const dateRegex     = /^\d{4}-\d{2}-\d{2}$/;
const phoneRegex    = /^\+?[0-9-]{10,15}$/;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const signin = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim(); password = password.trim();
    try {
        if (!email || !password) return res.json({ status: 'FAILED', message: 'Empty credentials supplied!' });
        const data = await User.findOne({ email });
        if (!data) return res.json({ status: 'FAILED', message: 'Invalid credentials entered!' });
        const match = await bcrypt.compare(password, data.password);
        if (!match) return res.json({ status: 'FAILED', message: 'Invalid password detected!' });
        const token = auth(res, data._id);
        res.json({ status: 'SUCCESS', message: 'Login successful', token, data });
    } catch (err) {
        console.error(err);
        res.json({ status: 'FAILED', message: 'An error occurred while checking for the existing user!' });
    }
};

export const signup = async (req, res) => {
    let { name, dateOfBirth, email, password, licenseNumber, specialization, clinicName, clinicAddress, phone } = req.body;
    [name, dateOfBirth, email, password, licenseNumber, specialization, clinicName, clinicAddress, phone] =
        [name, dateOfBirth, email, password, licenseNumber, specialization, clinicName, clinicAddress, phone].map(v => v?.trim());

    if (!name || !dateOfBirth || !email || !password || !licenseNumber || !specialization || !clinicName || !clinicAddress || !phone)
        return res.json({ status: 'FAILED', message: 'Empty input fields!' });
    if (!nameRegex.test(name))        return res.json({ status: 'FAILED', message: 'Invalid name entered!' });
    if (!emailRegex.test(email))      return res.json({ status: 'FAILED', message: 'Invalid email entered!' });
    if (!dateRegex.test(dateOfBirth)) return res.json({ status: 'FAILED', message: 'Invalid date of birth entered!' });
    if (password.length < 8)          return res.json({ status: 'FAILED', message: 'Password too short! (min 8 chars)' });
    if (!passwordRegex.test(password))return res.json({ status: 'FAILED', message: 'Password too weak!' });
    if (password.toLowerCase().includes(name.toLowerCase().split(' ')[0]))
        return res.json({ status: 'FAILED', message: 'Password cannot contain your name!' });
    if (!phoneRegex.test(phone))      return res.json({ status: 'FAILED', message: 'Invalid phone number!' });

    try {
        if (await User.findOne({ email }))
            return res.json({ status: 'FAILED', message: 'User with this email already exists.' });
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = new User({
            name, email, password, dateOfBirth, licenseNumber,
            specialization, clinicName, clinicAddress, phone,
            verificationToken, verificationTokenExpiresAt: Date.now() + 86400000, isVerified: false
        });
        const result = await newUser.save();
        const token  = auth(res, result._id);
        res.json({ status: 'SUCCESS', message: 'Signup successful!', token, data: result });
    } catch (err) {
        console.error(err);
        res.json({ status: 'FAILED', message: 'An error occurred while saving the user account!' });
    }
};

export const updateUserProfile = async (req,res) => {
    try {
        const { name, specialization, phone, dateOfBirth } = req.body;
        const userId = req.user.id; // From verifyJWT middleware

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, specialization, phone, dateOfBirth },
            { new: true } // Return the document after update
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            status: "SUCCESS",
            user_info: {
                name: updatedUser.name,
                email: updatedUser.email,
                specialization: updatedUser.specialization,
                phone: updatedUser.phone,
                dateOfBirth: updatedUser.dateOfBirth
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// ── Voice ─────────────────────────────────────────────────────────────────────
export const uploadVoiceClip = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No audio file provided' });
        const { patientPhone, patientName, doctorEmail, transcript } = req.body;
        const rec = new Recording({ userId: req.user.id, patientPhone, patientName, doctorEmail, transcript, filePath: req.file.path });
        await rec.save();
        res.status(201).json({ message: 'Success', data: rec });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const searchPatients = async (req, res) => {
    try {
        const { q } = req.query;
        const patients = await Patient.find({
            $or: [
                { name:  { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } }
            ]
        }).limit(5);
        res.status(200).json(patients);
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const savePrescription = async (req, res) => {
    try {
        const { patientName, patientPhone, patientAge, patientGender, patientCondition, diagnosis, medications, advice, templateId } = req.body;
        if (!patientName) return res.status(400).json({ error: 'patientName is required' });
        const doc = new Prescription({ userId: req.user.id, patientName, patientPhone, patientAge, patientGender, patientCondition, diagnosis, medications, advice, templateId });
        await doc.save();
        res.status(201).json({ message: 'Prescription saved successfully', data: doc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const savePrescriptionPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No PDF file provided' });
        console.log('Prescription PDF saved:', req.file.filename);
        res.status(201).json({
            message: 'PDF saved successfully',
            filePath: req.file.path,
            fileName: req.file.filename,
            url: `/uploads/prescriptions/${req.file.filename}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Templates ─────────────────────────────────────────────────────────────────

// GET /user/templates — only returns templates belonging to the logged-in doctor
export const getTemplates = async (req, res) => {
    try {
        // req.user is set by verifyToken middleware — contains { id: userId }
        const templates = await Template.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (err) {
        console.error('Get templates error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /user/save-template
export const saveTemplate = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload a letterhead image' });
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const { name, coords, doctorName } = req.body;

        const newTemplate = new Template({
            userId:    req.user.id,   // isolates templates per doctor
            name:      name || 'Untitled Template',
            doctorName: doctorName || '',
            imageUrl:  `/uploads/templates/${req.file.filename}`,
            coords:    JSON.parse(coords),
        });

        await newTemplate.save();
        // Return the template object directly (not wrapped) so frontend can use it as-is
        res.status(201).json(newTemplate);
    } catch (err) {
        console.error('Save template error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /user/templates/:id — only allows deleting own templates
export const deleteTemplate = async (req, res) => {
    try {
        const tpl = await Template.findOne({ _id: req.params.id, userId: req.user.id });
        if (!tpl) return res.status(404).json({ error: 'Template not found or not yours' });

        // Delete the image file from disk
        const filePath = `.${tpl.imageUrl}`;
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Template.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Template deleted' });
    } catch (err) {
        console.error('Delete template error:', err);
        res.status(500).json({ error: err.message });
    }
};