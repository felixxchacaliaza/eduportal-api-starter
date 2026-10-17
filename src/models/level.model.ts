import mongoose, { Schema, Document } from 'mongoose';

export interface ILevel extends Document {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
}

const LevelSchema = new Schema<ILevel>(
  {
    code: {
      type: String,
      required: [true, 'El código del nivel es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: INI-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: INI-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: INI-001, PRI-001, SEC-001)'
      ]
    },
    name: {
      type: String,
      required: [true, 'El nombre del nivel es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [1, 'El nombre debe tener al menos 1 caracter'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
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
    versionKey: false,
    timestamps: false,
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

export const LevelModel = mongoose.model<ILevel>('Level', LevelSchema, 'levels');
