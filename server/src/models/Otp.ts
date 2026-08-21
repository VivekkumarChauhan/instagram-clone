import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  phone?: string;
  otp: string;
  purpose: 'email_verification' | 'phone_verification' | 'forgot_password';
  tempUser?: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['email_verification', 'phone_verification', 'forgot_password'],
      default: 'email_verification',
    },
    tempUser: { type: Object },
    expiresAt: { type: Date, required: true, index: { expires: '10m' } },
  },
  { timestamps: true },
);

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
