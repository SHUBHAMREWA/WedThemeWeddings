import "server-only";
import mongoose, { Schema, type Model } from "mongoose";
import { RESOURCES, SETTINGS_FIELDS, type Field } from "@/lib/resources";
import { INQUIRY_STATUSES } from "@/lib/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyModel = Model<Record<string, any>>;

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    resourceType: { type: String, enum: ["image", "video", "raw"], default: "image" },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    originalName: String,
  },
  { _id: false }
);

const BOOLEAN_DEFAULT_TRUE = new Set(["active", "published"]);

function fieldsToDefinition(fields: Field[]) {
  const def: Record<string, any> = {};
  for (const f of fields) {
    switch (f.type) {
      case "number":
        def[f.name] = { type: Number, default: f.name === "order" ? 0 : undefined };
        break;
      case "boolean":
        def[f.name] = { type: Boolean, default: BOOLEAN_DEFAULT_TRUE.has(f.name) };
        break;
      case "date":
        def[f.name] = Date;
        break;
      case "list":
        def[f.name] = { type: [String], default: [] };
        break;
      case "image":
      case "pdf":
        def[f.name] = { type: MediaSchema, default: undefined };
        break;
      case "images":
        def[f.name] = { type: [MediaSchema], default: [] };
        break;
      default:
        def[f.name] = { type: String, trim: true, required: f.required || false };
    }
  }
  return def;
}

const MODEL_NAMES: Record<string, string> = {
  services: "Service",
  portfolio: "Album",
  packages: "Package",
  gear: "Gear",
  testimonials: "Testimonial",
  brochures: "Brochure",
};

export function getModel(resourceKey: string): AnyModel {
  const cfg = RESOURCES[resourceKey];
  if (!cfg) throw new Error(`Unknown resource ${resourceKey}`);
  const name = MODEL_NAMES[resourceKey];
  if (mongoose.models[name]) return mongoose.models[name] as AnyModel;
  const def = fieldsToDefinition(cfg.fields);
  if (cfg.hasSlug) def.slug = { type: String, unique: true, index: true, trim: true };
  const schema = new Schema(def, { timestamps: true });
  return mongoose.model(name, schema) as unknown as AnyModel;
}

/* ---------------- Settings (singleton) ---------------- */
export function getSettingsModel(): AnyModel {
  if (mongoose.models.Settings) return mongoose.models.Settings as AnyModel;
  const def = fieldsToDefinition(SETTINGS_FIELDS);
  def.key = { type: String, default: "main", unique: true };
  return mongoose.model("Settings", new Schema(def, { timestamps: true })) as unknown as AnyModel;
}

/* ---------------- Inquiries (leads from contact form) ---------------- */
export function getInquiryModel(): AnyModel {
  if (mongoose.models.Inquiry) return mongoose.models.Inquiry as AnyModel;
  const schema = new Schema(
    {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
      eventType: String,
      eventDate: Date,
      city: String,
      budget: String,
      services: { type: [String], default: [] },
      message: String,
      status: { type: String, enum: INQUIRY_STATUSES, default: "new" },
      notes: String,
    },
    { timestamps: true }
  );
  return mongoose.model("Inquiry", schema) as unknown as AnyModel;
}

/* ---------------- Admin users ---------------- */
export function getAdminModel(): AnyModel {
  if (mongoose.models.Admin) return mongoose.models.Admin as AnyModel;
  const schema = new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      name: String,
      passwordHash: { type: String, required: true },
    },
    { timestamps: true }
  );
  return mongoose.model("Admin", schema) as unknown as AnyModel;
}

/* ---------------- Email (SMTP) settings, singleton. Password is stored encrypted. ---------------- */
export function getMailConfigModel(): AnyModel {
  if (mongoose.models.MailConfig) return mongoose.models.MailConfig as AnyModel;
  const schema = new Schema(
    {
      key: { type: String, default: "main", unique: true },
      enabled: { type: Boolean, default: false },
      smtpHost: { type: String, default: "smtp.gmail.com", trim: true },
      smtpPort: { type: Number, default: 465 },
      smtpUser: { type: String, trim: true },
      smtpPassEnc: String,
      fromName: { type: String, trim: true },
      notifyTo: { type: String, trim: true },
      sendConfirmation: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
  return mongoose.model("MailConfig", schema) as unknown as AnyModel;
}
