import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);

export async function nextId(key, prefix, pad = 4) {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(doc.seq).padStart(pad, "0")}`;
}

export async function resetCounters(map) {
  for (const [key, seq] of Object.entries(map)) {
    await Counter.findByIdAndUpdate(key, { seq }, { upsert: true });
  }
}
