import mongoose, { Schema, Document, Types } from 'mongoose';

export type AttendanceStatus = 'PRESENTE' | 'TARDANZA' | 'FALTA_INJUSTIFICADA' | 'FALTA_JUSTIFICADA';

export interface IAttendance extends Document {
  id: string;
  code: string;
  student: Types.ObjectId;
  gradeSection: Types.ObjectId;
  academicYear: string;
  date: Date;
  status: AttendanceStatus;
  observation?: string;
  registeredBy: Types.ObjectId;
  enabled: boolean;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    code: {
      type: String,
      required: [true, 'El código de asistencia es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: ATT-001)']
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'El estudiante es obligatorio']
    },
    gradeSection: {
      type: Schema.Types.ObjectId,
      ref: 'GradeSection',
      required: [true, 'El salón es obligatorio']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo es obligatorio'],
      match: [/^\d{4}$/, 'El año lectivo debe tener 4 dígitos']
    },
    date: {
      type: Date,
      required: [true, 'La fecha de asistencia es obligatoria']
    },
    status: {
      type: String,
      enum: {
        values: ['PRESENTE', 'TARDANZA', 'FALTA_INJUSTIFICADA', 'FALTA_JUSTIFICADA'],
        message: 'Estado de asistencia no válido'
      },
      default: 'PRESENTE'
    },
    observation: {
      type: String,
      trim: true,
      default: ''
    },
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'La persona que registró la asistencia es obligatoria']
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

// Índice compuesto único: 1 sola asistencia por estudiante y fecha
AttendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true }
);

export const AttendanceModel = mongoose.model<IAttendance>('Attendance', AttendanceSchema, 'attendances');
