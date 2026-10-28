import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITeacherAssignment extends Document {
  id: string;
  code: string;
  teacher: Types.ObjectId;
  gradeSection: Types.ObjectId;
  subject: Types.ObjectId;
  academicYear: string;
  weeklyHours: number;
  enabled: boolean;
}

const TeacherAssignmentSchema = new Schema<ITeacherAssignment>(
  {
    code: {
      type: String,
      required: [true, 'El código de asignación es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: TAS-001)']
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'El docente es obligatorio']
    },
    gradeSection: {
      type: Schema.Types.ObjectId,
      ref: 'GradeSection',
      required: [true, 'El salón es obligatorio']
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'La asignatura es obligatoria']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo es obligatorio'],
      match: [/^\d{4}$/, 'El año lectivo debe tener 4 dígitos']
    },
    weeklyHours: {
      type: Number,
      required: [true, 'Las horas semanales son obligatorias'],
      min: [1, 'Debe asignar al menos 1 hora semanal']
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

// Índice compuesto: Una sola asignación de profesor por curso, salón y año
TeacherAssignmentSchema.index(
  { gradeSection: 1, subject: 1, academicYear: 1 },
  { unique: true }
);

export const TeacherAssignmentModel = mongoose.model<ITeacherAssignment>(
  'TeacherAssignment',
  TeacherAssignmentSchema,
  'teacher_assignments'
);
