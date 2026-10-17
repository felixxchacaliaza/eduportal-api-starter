import mongoose, { Document, Schema } from 'mongoose';

export type AcademicYearStatus = 'PLANIFICACION' | 'ACTIVO' | 'CERRADO';

export interface IAcademicYear extends Document {
  code: string;
  year: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: AcademicYearStatus;
  closedAt?: Date | null;
  enabled: boolean;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener exactamente 7 caracteres en formato AAA-000 (ej: AYE-001)']
    },
    year: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{4}$/, 'El año debe ser un número de 4 dígitos (ej: 2026)']
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria']
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de fin es obligatoria']
    },
    status: {
      type: String,
      enum: {
        values: ['PLANIFICACION', 'ACTIVO', 'CERRADO'],
        message: 'El estado debe ser PLANIFICACION, ACTIVO o CERRADO'
      },
      default: 'PLANIFICACION'
    },
    closedAt: {
      type: Date,
      default: null
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'academic_years',
    versionKey: false,
    timestamps: false
  }
);

// Formateo de respuesta JSON
academicYearSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const AcademicYearModel = mongoose.model<IAcademicYear>('AcademicYear', academicYearSchema);
