import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Department } from "../models/Department.js";
import { Patient } from "../models/Patient.js";
import { EhrRecord } from "../models/EhrRecord.js";
import { Appointment } from "../models/Appointment.js";
import { OpVisit } from "../models/OpVisit.js";
import { Consultation } from "../models/Consultation.js";
import { Prescription } from "../models/Prescription.js";
import { LabTest } from "../models/LabTest.js";
import { LabReport } from "../models/LabReport.js";
import { Medicine } from "../models/Medicine.js";
import { MedicineSale } from "../models/MedicineSale.js";
import { Bill } from "../models/Bill.js";
import { Payment } from "../models/Payment.js";
import { Notification } from "../models/Notification.js";
import { AuditLog } from "../models/AuditLog.js";
import { resetCounters } from "../utils/ids.js";

const PASS = "Elara@2026";

async function hash() {
  return bcrypt.hash(PASS, 10);
}

async function run() {
  await connectDb(process.env.MONGO_URI);
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Patient.deleteMany({}),
    EhrRecord.deleteMany({}),
    Appointment.deleteMany({}),
    OpVisit.deleteMany({}),
    Consultation.deleteMany({}),
    Prescription.deleteMany({}),
    LabTest.deleteMany({}),
    LabReport.deleteMany({}),
    Medicine.deleteMany({}),
    MedicineSale.deleteMany({}),
    Bill.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const passwordHash = await hash();

  const admin = await User.create({
    name: "Maya Rao",
    email: "maya.rao@elara.care",
    passwordHash,
    role: "admin",
    phone: "9845010001",
    avatarSeed: "Maya Rao",
  });

  const deptDefs = [
    { name: "General Medicine", slug: "general-medicine", floor: "L1 · West", opHours: "08:00–16:00", consultFee: 500, spec: "Internal Medicine" },
    { name: "Cardiology", slug: "cardiology", floor: "L3 · Heart Wing", opHours: "09:00–17:00", consultFee: 900, spec: "Interventional Cardiology" },
    { name: "Orthopedics", slug: "orthopedics", floor: "L2 · North", opHours: "08:30–15:30", consultFee: 800, spec: "Sports Orthopedics" },
    { name: "Pediatrics", slug: "pediatrics", floor: "L1 · Garden Court", opHours: "09:00–16:00", consultFee: 600, spec: "Pediatric Medicine" },
    { name: "Gynecology", slug: "gynecology", floor: "L2 · South", opHours: "09:00–16:30", consultFee: 750, spec: "Obstetrics & Gynecology" },
    { name: "Neurology", slug: "neurology", floor: "L4 · Quiet Wing", opHours: "10:00–16:00", consultFee: 950, spec: "Clinical Neurology" },
    { name: "Dermatology", slug: "dermatology", floor: "L1 · East", opHours: "10:00–15:00", consultFee: 700, spec: "Clinical Dermatology" },
  ];

  const doctorNames = [
    ["Leela Krishnan", "leela.krishnan@elara.care"],
    ["Arjun Mehta", "arjun.mehta@elara.care"],
    ["Farhan Qureshi", "farhan.qureshi@elara.care"],
    ["Sana Iqbal", "sana.iqbal@elara.care"],
    ["Meera Joseph", "meera.joseph@elara.care"],
    ["Rohit Sen", "rohit.sen@elara.care"],
    ["Ananya Bose", "ananya.bose@elara.care"],
  ];

  const departments = [];
  const doctors = [];
  for (let i = 0; i < deptDefs.length; i++) {
    const d = deptDefs[i];
    const doc = await User.create({
      name: doctorNames[i][0],
      email: doctorNames[i][1],
      passwordHash,
      role: "doctor",
      specialty: d.spec,
      phone: `98450200${10 + i}`,
      avatarSeed: doctorNames[i][0],
    });
    const dept = await Department.create({
      name: d.name,
      slug: d.slug,
      floor: d.floor,
      opHours: d.opHours,
      consultFee: d.consultFee,
      head: doc._id,
      description: `${d.name} outpatient clinic at Elara.`,
    });
    doc.department = dept._id;
    await doc.save();
    departments.push(dept);
    doctors.push(doc);
  }

  const nurse = await User.create({
    name: "Nina Das",
    email: "nina.das@elara.care",
    passwordHash,
    role: "nurse",
    phone: "9845030011",
    avatarSeed: "Nina Das",
    department: departments[0]._id,
  });
  await User.create({
    name: "Kabir Shaw",
    email: "kabir.shaw@elara.care",
    passwordHash,
    role: "pharmacy",
    phone: "9845030022",
    avatarSeed: "Kabir Shaw",
  });
  await User.create({
    name: "Leena Ibrahim",
    email: "leena.ibrahim@elara.care",
    passwordHash,
    role: "billing",
    phone: "9845030033",
    avatarSeed: "Leena Ibrahim",
  });

  const patientUsers = [
    ["Priya Nair", "priya.nair@mail.test", "female", "1996-04-12", "O+", ["Penicillin"], ["Migraine"]],
    ["Vikram Shah", "vikram.shah@mail.test", "male", "1984-11-02", "B+", ["Dust"], ["Hypertension"]],
    ["Asha Reddy", "asha.reddy@mail.test", "female", "1978-07-19", "A+", [], ["Type 2 Diabetes"]],
    ["Jonah Philip", "jonah.philip@mail.test", "male", "2018-01-09", "O-", [], ["Asthma"]],
    ["Ritika Malhotra", "ritika.m@mail.test", "female", "1991-09-30", "AB+", ["Sulfa"], []],
  ];

  const patients = [];
  for (let i = 0; i < patientUsers.length; i++) {
    const [name, email, gender, dob, bloodGroup, allergies, chronic] = patientUsers[i];
    const u = await User.create({
      name,
      email,
      passwordHash,
      role: "patient",
      phone: `90080010${i}${i}`,
      avatarSeed: name,
    });
    const p = await Patient.create({
      mrn: `PAT${String(i + 1).padStart(4, "0")}`,
      user: u._id,
      name,
      email,
      phone: u.phone,
      gender,
      dob,
      bloodGroup,
      allergies,
      chronicIllnesses: chronic,
      address: "12, Maple Lane, Bengaluru",
    });
    await EhrRecord.create({
      patient: p._id,
      summary: `${name.split(" ")[0]} is followed in outpatient care.`,
      vitalsLatest: { bp: "118/76", hr: "72", temp: "36.7", spo2: "98", weight: "62" },
    });
    patients.push(p);
  }

  const now = new Date();
  const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  await Appointment.create({
    token: "A204411",
    patient: patients[0]._id,
    doctor: doctors[1]._id,
    department: departments[1]._id,
    scheduledAt: later,
    reason: "Follow-up after palpitations last week",
    source: "online",
  });

  const visit = await OpVisit.create({
    opNumber: "OP00001",
    patient: patients[1]._id,
    department: departments[1]._id,
    doctor: doctors[1]._id,
    visitDate: now,
    reason: "Chest tightness on climbing stairs",
    queueStatus: "waiting",
    tokenNo: 1,
  });
  await OpVisit.create({
    opNumber: "OP00002",
    patient: patients[2]._id,
    department: departments[0]._id,
    doctor: doctors[0]._id,
    visitDate: now,
    reason: "Review of sugars",
    queueStatus: "in-consultation",
    tokenNo: 1,
  });
  const doneVisit = await OpVisit.create({
    opNumber: "OP00003",
    patient: patients[0]._id,
    department: departments[5]._id,
    doctor: doctors[5]._id,
    visitDate: new Date(now.getTime() - 86400000 * 4),
    reason: "Recurring headaches",
    queueStatus: "completed",
    visitStatus: "complete",
    tokenNo: 4,
  });

  await Consultation.create({
    visit: doneVisit._id,
    patient: patients[0]._id,
    doctor: doctors[5]._id,
    symptoms: ["Headache", "Photophobia"],
    diagnosis: "Migraine without aura",
    notes: "Sleep debt likely trigger. Avoid skipped meals.",
    vitals: { bp: "110/70", hr: "68", temp: "36.6", spo2: "99" },
  });
  const rx = await Prescription.create({
    visit: doneVisit._id,
    patient: patients[0]._id,
    doctor: doctors[5]._id,
    items: [
      { medicine: "Naproxen 250mg", dosage: "1-0-1", duration: "5 days", instructions: "After food" },
      { medicine: "Propranolol 20mg", dosage: "0-0-1", duration: "30 days", instructions: "Night" },
    ],
    dispensed: true,
  });

  const lab = await LabTest.create({
    visit: doneVisit._id,
    patient: patients[0]._id,
    doctor: doctors[5]._id,
    testName: "Thyroid Test",
    status: "completed",
    fee: 650,
    collectedAt: new Date(now.getTime() - 86400000 * 3),
    completedAt: new Date(now.getTime() - 86400000 * 3),
  });
  await LabReport.create({
    labTest: lab._id,
    patient: patients[0]._id,
    findings: "Euthyroid. No biochemical explanation for headache.",
    values: [
      { label: "TSH", value: "2.1 mIU/L", range: "0.4–4.0" },
      { label: "FT4", value: "1.2 ng/dL", range: "0.8–1.8" },
    ],
  });
  await LabTest.create({
    visit: visit._id,
    patient: patients[1]._id,
    doctor: doctors[1]._id,
    testName: "ECG",
    status: "requested",
    fee: 700,
  });

  const meds = [
    { sku: "NAP250", name: "Naproxen", generic: "Naproxen", form: "tablet", strength: "250mg", stock: 140, reorderAt: 30, unitPrice: 18 },
    { sku: "PRP20", name: "Propranolol", generic: "Propranolol", form: "tablet", strength: "20mg", stock: 16, reorderAt: 25, unitPrice: 12 },
    { sku: "AMX500", name: "Amoxicillin", generic: "Amoxicillin", form: "capsule", strength: "500mg", stock: 80, reorderAt: 20, unitPrice: 14 },
    { sku: "PCM650", name: "Paracetamol", generic: "Paracetamol", form: "tablet", strength: "650mg", stock: 220, reorderAt: 40, unitPrice: 4 },
    { sku: "ATOR10", name: "Atorvastatin", generic: "Atorvastatin", form: "tablet", strength: "10mg", stock: 18, reorderAt: 20, unitPrice: 22 },
    { sku: "MET500", name: "Metformin", generic: "Metformin", form: "tablet", strength: "500mg", stock: 90, reorderAt: 25, unitPrice: 6 },
  ];
  const createdMeds = await Medicine.insertMany(meds);
  await MedicineSale.create({
    prescription: rx._id,
    patient: patients[0]._id,
    items: [
      { medicine: createdMeds[0]._id, name: "Naproxen", qty: 10, unitPrice: 18 },
      { medicine: createdMeds[1]._id, name: "Propranolol", qty: 30, unitPrice: 12 },
    ],
    total: 18 * 10 + 12 * 30,
  });

  const bill = await Bill.create({
    invoiceNo: "INV2026001",
    visit: doneVisit._id,
    patient: patients[0]._id,
    lines: [
      { kind: "consult", label: "Neurology consultation", amount: 950 },
      { kind: "lab", label: "Thyroid Test", amount: 650 },
      { kind: "medicine", label: "Pharmacy", amount: 540 },
    ],
    subtotal: 2140,
    tax: 107,
    total: 2247,
    status: "paid",
    paidAmount: 2247,
  });
  await Payment.create({ bill: bill._id, amount: 2247, method: "upi" });

  await Bill.create({
    invoiceNo: "INV2026002",
    visit: visit._id,
    patient: patients[1]._id,
    lines: [{ kind: "consult", label: "Cardiology consultation", amount: 900 }],
    subtotal: 900,
    tax: 45,
    total: 945,
    status: "pending",
    paidAmount: 0,
  });

  await Notification.create({
    role: "nurse",
    title: "ECG pending collection",
    body: "Vikram Shah · Cardiology queue",
    href: "/lab",
  });
  await AuditLog.create({
    actor: admin._id,
    action: "seed",
    entity: "System",
    meta: { note: "Demo campus loaded" },
  });

  await resetCounters({ patient: 5, op: 3, invoice: 2 });

  console.log("Seeded Elara Medical Centre");
  console.log("Password for all accounts: Elara@2026");
  console.log("Admin     maya.rao@elara.care");
  console.log("Doctor    arjun.mehta@elara.care");
  console.log("Nurse     nina.das@elara.care");
  console.log("Pharmacy  kabir.shaw@elara.care");
  console.log("Billing   leena.ibrahim@elara.care");
  console.log("Patient   priya.nair@mail.test");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
