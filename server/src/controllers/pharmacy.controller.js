import { Medicine } from "../models/Medicine.js";
import { MedicineSale } from "../models/MedicineSale.js";
import { Prescription } from "../models/Prescription.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";

export const listMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find().sort({ name: 1 });
  res.json({ success: true, medicines });
});

export const upsertMedicine = asyncHandler(async (req, res) => {
  const med = req.params.id
    ? await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true })
    : await Medicine.create(req.body);
  res.json({ success: true, medicine: med });
});

export const pendingRx = asyncHandler(async (req, res) => {
  const rxs = await Prescription.find({ dispensed: false }).populate("patient doctor visit").sort({ createdAt: -1 });
  res.json({ success: true, prescriptions: rxs });
});

export const dispense = asyncHandler(async (req, res) => {
  const rx = await Prescription.findById(req.params.id);
  if (!rx) throw new ApiError(404, "Prescription not found");
  const items = [];
  let total = 0;
  for (const line of req.body.items || []) {
    const med = await Medicine.findById(line.medicine);
    if (!med) throw new ApiError(404, "Medicine missing from inventory");
    if (med.stock < line.qty) throw new ApiError(400, `${med.name} is short in stock`);
    med.stock -= line.qty;
    await med.save();
    items.push({ medicine: med._id, name: med.name, qty: line.qty, unitPrice: med.unitPrice });
    total += med.unitPrice * line.qty;
  }
  rx.dispensed = true;
  await rx.save();
  const sale = await MedicineSale.create({
    prescription: rx._id,
    patient: rx.patient,
    items,
    total,
    dispensedBy: req.user._id,
  });
  res.status(201).json({ success: true, sale });
});
