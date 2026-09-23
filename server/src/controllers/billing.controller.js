import { Bill } from "../models/Bill.js";
import { Payment } from "../models/Payment.js";
import { OpVisit } from "../models/OpVisit.js";
import { LabTest } from "../models/LabTest.js";
import { MedicineSale } from "../models/MedicineSale.js";
import { Department } from "../models/Department.js";
import { nextId } from "../utils/ids.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";
import { renderInvoicePdf } from "../utils/pdf.js";

export const composeInvoice = asyncHandler(async (req, res) => {
  const visit = await OpVisit.findById(req.body.visit).populate("department patient");
  if (!visit) throw new ApiError(404, "Visit not found");
  const existing = await Bill.findOne({ visit: visit._id });
  if (existing) return res.json({ success: true, bill: existing });

  const dept = await Department.findById(visit.department);
  const labs = await LabTest.find({ visit: visit._id });
  const sales = await MedicineSale.find({ patient: visit.patient }).sort({ createdAt: -1 }).limit(3);
  const lines = [{ kind: "consult", label: `${dept?.name || "OP"} consultation`, amount: dept?.consultFee || 600 }];
  labs.forEach((l) => lines.push({ kind: "lab", label: l.testName, amount: l.fee }));
  sales
    .filter((s) => Date.now() - new Date(s.createdAt).getTime() < 1000 * 60 * 60 * 12)
    .forEach((s) => lines.push({ kind: "medicine", label: "Pharmacy", amount: s.total }));
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const tax = Math.round(subtotal * 0.05);
  const year = new Date().getFullYear();
  const invoiceNo = await nextId("invoice", `INV${year}`, 3);
  const bill = await Bill.create({
    invoiceNo,
    visit: visit._id,
    patient: visit.patient,
    lines,
    subtotal,
    tax,
    total: subtotal + tax,
  });
  res.status(201).json({ success: true, bill });
});

export const listBills = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role === "patient") {
    const { Patient } = await import("../models/Patient.js");
    const p = await Patient.findOne({ user: req.user._id });
    filter.patient = p?._id;
  }
  const bills = await Bill.find(filter).populate("patient visit").sort({ createdAt: -1 });
  res.json({ success: true, bills });
});

export const payBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new ApiError(404, "Invoice not found");
  const amount = Number(req.body.amount);
  await Payment.create({
    bill: bill._id,
    amount,
    method: req.body.method || "upi",
    receivedBy: req.user._id,
  });
  bill.paidAmount += amount;
  if (bill.paidAmount >= bill.total) bill.status = "paid";
  else if (bill.paidAmount > 0) bill.status = "partial";
  await bill.save();
  if (bill.status === "paid" && bill.visit) {
    await OpVisit.findByIdAndUpdate(bill.visit, { visitStatus: "complete", queueStatus: "completed" });
  }
  res.json({ success: true, bill });
});

export const invoicePdf = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate("patient");
  if (!bill) throw new ApiError(404, "Invoice not found");
  renderInvoicePdf(res, bill);
});
