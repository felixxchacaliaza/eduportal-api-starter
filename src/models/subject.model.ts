import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  id: string;
  code: string;
  name: string;
  description: string;
  area: Types.ObjectId;
  weeklyHours: number;
  enabled: boolean;
}

const SubjectSchema = new Schema<ISubject>(
  {
    code: {
      type: String,
      required: [true, 'El código de la asignatura es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: MAT-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: MAT-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: MAT-001, HUM-001)'
      ]
    },
    name: {
      type: String,
      required: [true, 'El nombre de la asignatura es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'La descripción no puede exceder los 100 caracteres']
    },
    area: {
      type: Schema.Types.ObjectId,
      ref: 'Area',
      required: [true, 'El área curricular (area) es obligatoria']
    },
    weeklyHours: {
      type: Number,
      required: [true, 'Las horas semanales (weeklyHours) son obligatorias'],
      min: [1, 'Las horas semanales deben ser al menos 1']
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

export const SubjectModel = mongoose.model<ISubject>('Subject', SubjectSchema, 'subjects');
