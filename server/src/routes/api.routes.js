import { Router } from "express";
import { protect, allow } from "../middlewares/auth.js";
import { listDepartments, upsertDepartment, listDoctors } from "../controllers/department.controller.js";
import {
  registerWalkIn,
  searchPatients,
  getPatient,
  getEhr,
} from "../controllers/patient.controller.js";
import { createAppointment, listAppointments, patchAppointment } from "../controllers/appointment.controller.js";
import { createOp, queue, setQueueStatus, opAnalytics, visitHistory, getVisit } from "../controllers/op.controller.js";
import { saveConsult, getConsult, prescriptionPdf } from "../controllers/consult.controller.js";
import { listLabs, patchLab, uploadReport } from "../controllers/lab.controller.js";
import { listMedicines, upsertMedicine, pendingRx, dispense } from "../controllers/pharmacy.controller.js";
import { composeInvoice, listBills, payBill, invoicePdf } from "../controllers/billing.controller.js";
import {
  adminKpis,
  doctorKpis,
  nurseKpis,
  pharmacyKpis,
  billingKpis,
  patientHome,
  activities,
  notifications,
  searchAll,
} from "../controllers/dashboard.controller.js";

const r = Router();
r.use(protect);

r.get("/departments", listDepartments);
r.get("/doctors", listDoctors);
r.post("/departments", allow("admin"), upsertDepartment);
r.patch("/departments/:id", allow("admin"), upsertDepartment);

r.get("/patients", allow("admin", "doctor", "nurse", "pharmacy", "billing"), searchPatients);
r.post("/patients", allow("nurse", "admin"), registerWalkIn);
r.get("/patients/:id", getPatient);
r.get("/ehr/:id", getEhr);

r.get("/appointments", listAppointments);
r.post("/appointments", createAppointment);
r.patch("/appointments/:id", patchAppointment);

r.post("/op", allow("nurse", "admin"), createOp);
r.get("/op/queue", queue);
r.get("/op/analytics", allow("admin", "nurse"), opAnalytics);
r.get("/op/history/:patientId", visitHistory);
r.get("/op/:id", getVisit);
r.patch("/op/:id/status", allow("doctor", "nurse", "admin"), setQueueStatus);

r.post("/consult/:visitId", allow("doctor"), saveConsult);
r.get("/consult/:visitId", getConsult);
r.get("/prescriptions/:id/pdf", prescriptionPdf);

r.get("/labs", allow("nurse", "doctor", "admin"), listLabs);
r.patch("/labs/:id", allow("nurse", "admin"), patchLab);
r.post("/labs/:id/report", allow("nurse", "admin"), uploadReport);

r.get("/medicines", allow("pharmacy", "admin", "doctor"), listMedicines);
r.post("/medicines", allow("pharmacy", "admin"), upsertMedicine);
r.patch("/medicines/:id", allow("pharmacy", "admin"), upsertMedicine);
r.get("/pharmacy/pending", allow("pharmacy", "admin"), pendingRx);
r.post("/pharmacy/dispense/:id", allow("pharmacy"), dispense);

r.get("/bills", allow("billing", "admin", "patient", "nurse"), listBills);
r.post("/bills/compose", allow("billing", "admin"), composeInvoice);
r.post("/bills/:id/pay", allow("billing", "admin"), payBill);
r.get("/bills/:id/pdf", invoicePdf);

r.get("/dash/admin", allow("admin"), adminKpis);
r.get("/dash/doctor", allow("doctor"), doctorKpis);
r.get("/dash/nurse", allow("nurse"), nurseKpis);
r.get("/dash/pharmacy", allow("pharmacy"), pharmacyKpis);
r.get("/dash/billing", allow("billing"), billingKpis);
r.get("/dash/patient", allow("patient"), patientHome);
r.get("/activity", allow("admin"), activities);
r.get("/notifications", notifications);
r.get("/search", searchAll);

export default r;
