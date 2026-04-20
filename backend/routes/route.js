import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
    signin, signup,
    uploadVoiceClip, searchPatients,
    savePrescription, savePrescriptionPDF,
    saveTemplate, getTemplates, deleteTemplate, updateUserProfile,
} from "../api/User.js";
import verifyJWT from "../middleware/verifyJWT.js";
import { logout } from "../middleware/auth.js"

const router = express.Router();

// ── Voice recordings ──────────────────────────────────────────────────────────
const recordingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/recordings';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `rec-${Date.now()}${path.extname(file.originalname || '.webm')}`);
    }
});

// ── Template images ───────────────────────────────────────────────────────────
const templateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/templates';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `tpl-${Date.now()}-${safe}`);
    }
});

// ── Prescription PDFs ─────────────────────────────────────────────────────────
const prescriptionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/prescriptions';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `rx-${Date.now()}-${safe}`);
    }
});

const uploadRecording    = multer({ storage: recordingStorage });
const uploadTemplate     = multer({
    storage: templateStorage,
    fileFilter: (req, file, cb) => {
        cb(null, ['image/png','image/jpeg','image/jpg','image/webp'].includes(file.mimetype));
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});
const uploadPrescription = multer({
    storage: prescriptionStorage,
    fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
    limits: { fileSize: 20 * 1024 * 1024 }
});

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/signin", signin);
router.post("/signup", signup);
router.post("/logout", logout);

router.use(verifyJWT);

// ── Voice ─────────────────────────────────────────────────────────────────────
router.post("/upload-voice", uploadRecording.single('audio'), uploadVoiceClip);

// ── Patients ──────────────────────────────────────────────────────────────────
router.get("/search-patients", searchPatients);
router.post("/update-profile", updateUserProfile);

// ── Prescriptions ─────────────────────────────────────────────────────────────
router.post("/save-prescription",     savePrescription);
router.post("/save-prescription-pdf", uploadPrescription.single('pdf'), savePrescriptionPDF);

// ── Templates (all protected — verifyToken checks the JWT) ───────────────────

router.get("/templates", getTemplates);
router.post("/save-template", uploadTemplate.single('image'), saveTemplate);
router.delete("/templates/:id", deleteTemplate);

export default router;