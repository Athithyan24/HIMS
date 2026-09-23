import { AuditLog } from "../models/AuditLog.js";
import { Notification } from "../models/Notification.js";

export async function writeAudit(actor, action, entity, entityId, meta) {
  await AuditLog.create({ actor, action, entity, entityId, meta });
}

export async function notify({ user, role, title, body, href }) {
  await Notification.create({ user, role, title, body, href });
}
