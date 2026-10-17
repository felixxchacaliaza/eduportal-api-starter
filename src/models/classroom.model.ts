import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroom extends Document {
  id: string;
  code: string;
  name: string;
  capacity: number;
  description: string;
  enabled: boolean;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    code: {
      type: String,
      required: [true, 'El código del aula es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: AUL-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: AUL-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: AUL-001)'
      ]
    },
    name: {
      type: String,
      required: [true, 'El número/nombre del aula es obligatorio (ej: 101, 102, 201)'],
      unique: true,
      trim: true,
      match: [
        /^\d{3}$/,
        'El formato del aula debe ser de 3 dígitos numéricos donde el primero indica el piso (ej: 101, 102, 201, 301)'
      ]
    },
    capacity: {
      type: Number,
      required: [true, 'La capacidad o aforo del aula es obligatoria'],
      min: [1, 'La capacidad debe ser de al menos 1 alumno']
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

export const ClassroomModel = mongoose.model<IClassroom>('Classroom', ClassroomSchema, 'classrooms');
