import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGrade extends Document {
  id: string;
  code: string;
  name: number;
  description: string;
  level: Types.ObjectId;
  enabled: boolean;
}

const GradeSchema = new Schema<IGrade>(
  {
    code: {
      type: String,
      required: [true, 'El código del grado es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: GRA-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: GRA-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: GRA-001)'
      ]
    },
    name: {
      type: Number,
      required: [true, 'El número del grado (name: 1, 2, 3...) es obligatorio'],
      min: [1, 'El número del grado debe ser al menos 1']
    },
    description: {
      type: String,
      required: [true, 'La descripción del grado es obligatoria'],
      trim: true,
      maxlength: [100, 'La descripción no puede exceder los 100 caracteres']
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: 'Level',
      required: [true, 'El nivel educativo (level) es obligatorio']
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

export const GradeModel = mongoose.model<IGrade>('Grade', GradeSchema, 'grades');
