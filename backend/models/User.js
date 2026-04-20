import mongoose from "mongoose";
import bcrypt from "bcrypt";

const RecordingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientPhone: String,
    patientName: String,
    doctorEmail: String,
    filePath: String,
    transcript: String,
    createdAt: { type: Date, default: Date.now }
});

const UserSchema = mongoose.Schema({
    name:           { type: String, required: true },
    dateOfBirth:    { type: Date,   required: true },
    email:          { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    licenseNumber:  { type: String, required: true },
    specialization: { type: String, required: true },
    clinicName:     { type: String, required: true },
    clinicAddress:  { type: String },
    phone:          { type: String },
    lastLogin:      { type: Date,    default: Date.now },
    isVerified:     { type: Boolean, default: false },
    verificationToken:          String,
    verificationTokenExpiresAt: Date,
}, {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.password; return ret; } }
});

const PatientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true },
    phone:     { type: String, required: true, unique: true },
    age:       Number,
    gender:    String,
    condition: String,
    lastVisit: { type: Date, default: Date.now }
});

const PrescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName:      { type: String, required: true },
    patientPhone:     String,
    patientAge:       String,
    patientGender:    String,
    patientCondition: String,
    diagnosis:        String,
    medications:      [{ name: String, dosage: String, timing: String, duration: String }],
    advice:           String,
    templateId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
}, { timestamps: true });

// NEW: stores uploaded letterhead templates with their content-area coords
const TemplateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true },
    imageUrl:  { type: String, required: true }, // served from /uploads/templates/
    doctorName: { type: String, required: true },
    coords:    {
        top:    Number,
        left:   Number,
        width:  Number,
        height: Number,
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export const Patient      = mongoose.models.Patient      || mongoose.model('Patient',      PatientSchema);
export const User         = mongoose.models.User         || mongoose.model('User',         UserSchema, 'doctors');
export const Recording    = mongoose.models.Recording    || mongoose.model('Recording',    RecordingSchema);
export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
export const Template     = mongoose.models.Template     || mongoose.model('Template',     TemplateSchema);