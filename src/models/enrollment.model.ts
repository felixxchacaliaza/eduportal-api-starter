import mongoose, { Schema, Document, Types } from 'mongoose';

export type EnrollmentType = 'REGULAR' | 'INGRESANTE' | 'TRASLADO';
export type EnrollmentStatus = 'MATRICULADO' | 'TRASLADADO' | 'RETIRADO';

export interface IEnrollment extends Document {
  id: string;
  code: string;
  student: Types.ObjectId;
  gradeSection: Types.ObjectId;
  academicYear: string;
  enrollmentType: EnrollmentType;
  status: EnrollmentStatus;
  enrolledAt: Date;
  enabled: boolean;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    code: {
      type: String,
      required: [true, 'El código de matrícula es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: MAT-001)']
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'El estudiante es obligatorio']
    },
    gradeSection: {
      type: Schema.Types.ObjectId,
      ref: 'GradeSection',
      required: [true, 'El salón (grado-sección) es obligatorio']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo es obligatorio'],
      match: [/^\d{4}$/, 'El año lectivo debe tener 4 dígitos']
    },
    enrollmentType: {
      type: String,
      enum: {
        values: ['REGULAR', 'INGRESANTE', 'TRASLADO'],
        message: 'Tipo de matrícula no válido'
      },
      default: 'REGULAR'
    },
    status: {
      type: String,
      enum: {
        values: ['MATRICULADO', 'TRASLADADO', 'RETIRADO'],
        message: 'Estado de matrícula no válido'
      },
      default: 'MATRICULADO'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
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

// Índice compuesto único: 1 sola matrícula por estudiante en el mismo año lectivo
EnrollmentSchema.index(
  { student: 1, academicYear: 1 },
  { unique: true }
);

export const EnrollmentModel = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema, 'enrollments');
