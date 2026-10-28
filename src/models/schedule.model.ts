import mongoose, { Schema, Document, Types } from 'mongoose';

export type DayOfWeekType = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';

export interface ISchedule extends Document {
  id: string;
  code: string;
  teacherAssignment: Types.ObjectId;
  gradeSection: Types.ObjectId;
  subject: Types.ObjectId;
  teacher: Types.ObjectId;
  academicYear: string;
  dayOfWeek: DayOfWeekType;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    code: {
      type: String,
      required: [true, 'El código del horario es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: SCH-001)']
    },
    teacherAssignment: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherAssignment',
      required: [true, 'La asignación docente es obligatoria']
    },
    gradeSection: {
      type: Schema.Types.ObjectId,
      ref: 'GradeSection',
      required: [true, 'El salón es obligatorio']
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'La materia es obligatoria']
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'El profesor es obligatorio']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo es obligatorio'],
      match: [/^\d{4}$/, 'El año lectivo debe tener 4 dígitos']
    },
    dayOfWeek: {
      type: String,
      enum: {
        values: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
        message: 'Día de la semana no válido'
      },
      required: [true, 'El día de la semana es obligatorio']
    },
    startTime: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria'],
      match: [/^\d{2}:\d{2}$/, 'Formato de hora HH:mm inválido (ej: 08:00)']
    },
    endTime: {
      type: String,
      required: [true, 'La hora de fin es obligatoria'],
      match: [/^\d{2}:\d{2}$/, 'Formato de hora HH:mm inválido (ej: 09:30)']
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

export const ScheduleModel = mongoose.model<ISchedule>('Schedule', ScheduleSchema, 'schedules');
