import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGradeSubject extends Document {
  id: string;
  code: string;
  grade: Types.ObjectId;
  subject: Types.ObjectId;
  academicYear: string;
  weeklyHours: number;
  enabled: boolean;
}

const GradeSubjectSchema = new Schema<IGradeSubject>(
  {
    code: {
      type: String,
      required: [true, 'El código de asignación curricular es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: GSB-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: GSB-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener 3 letras mayúsculas, un guión y 3 dígitos (ej: GSB-001)'
      ]
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'El grado escolar (grade) es obligatorio']
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'La asignatura curricular (subject) es obligatoria']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo (academicYear) es obligatorio'],
      trim: true,
      match: [/^\d{4}$/, 'El año lectivo debe ser un año de 4 dígitos (ej: 2026)']
    },
    weeklyHours: {
      type: Number,
      required: [true, 'Las horas semanales son obligatorias'],
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

// Índice compuesto único: No repetir la misma Asignatura en el mismo Grado y Año Lectivo
GradeSubjectSchema.index(
  { grade: 1, subject: 1, academicYear: 1 },
  { unique: true }
);

export const GradeSubjectModel = mongoose.model<IGradeSubject>('GradeSubject', GradeSubjectSchema, 'grade_subjects');
