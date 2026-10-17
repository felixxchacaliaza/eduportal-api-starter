import mongoose, { Schema, Document } from 'mongoose';

export interface IArea extends Document {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
}

const AreaSchema = new Schema<IArea>(
  {
    code: {
      type: String,
      required: [true, 'El code es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El code debe tener exactamente 7 caracteres (ej: CIE-001)'],
      maxlength: [7, 'El code debe tener exactamente 7 caracteres (ej: CIE-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El code debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: CIE-001, HUM-001)'
      ]
    },
    name: {
      type: String,
      required: [true, 'El name es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'El name debe tener al menos 3 caracteres'],
      maxlength: [100, 'El name no puede exceder los 100 caracteres']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'La descripción no puede exceder los 100 caracteres']
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    versionKey: false, // Sin __v
    timestamps: false, // Sin createdAt ni updatedAt: estrictamente id, code, name
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

export const AreaModel = mongoose.model<IArea>('Area', AreaSchema, 'areas');
