import mongoose, { Schema, Document } from 'mongoose';

export type GenderType = 'M' | 'F';

export interface IPerson extends Document {
  id: string;
  code: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  gender: GenderType;
  phone?: string;
  personalEmail: string;
  address?: string;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    code: {
      type: String,
      required: [true, 'El código de la persona es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: PER-001)']
    },
    dni: {
      type: String,
      required: [true, 'El DNI es obligatorio'],
      unique: true,
      trim: true,
      match: [/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos numéricos']
    },
    firstName: {
      type: String,
      required: [true, 'Los nombres son obligatorios'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Los apellidos son obligatorios'],
      trim: true
    },
    birthDate: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: {
        values: ['M', 'F'],
        message: 'El género debe ser M o F'
      },
      required: [true, 'El género es obligatorio']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    personalEmail: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo electrónico no tiene un formato válido']
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

export const PersonModel = mongoose.model<IPerson>('Person', PersonSchema, 'persons');
