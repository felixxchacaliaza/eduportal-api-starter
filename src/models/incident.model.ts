import mongoose, { Schema, Document, Types } from 'mongoose';

export type IncidentType = 'MERITO' | 'DEMERITO' | 'ATENCION_PSICOLOGICA' | 'CITACION_APODERADO';
export type SeverityType = 'LEVE' | 'MODERADA' | 'GRAVE';
export type IncidentStatus = 'ABIERTA' | 'EN_SEGUIMIENTO' | 'CERRADA';

export interface IIncident extends Document {
  id: string;
  code: string;
  student: Types.ObjectId;
  gradeSection: Types.ObjectId;
  academicYear: string;
  reportedBy: Types.ObjectId;
  type: IncidentType;
  severity: SeverityType;
  title: string;
  description: string;
  actionTaken?: string;
  incidentDate: Date;
  status: IncidentStatus;
  enabled: boolean;
}

const IncidentSchema = new Schema<IIncident>(
  {
    code: {
      type: String,
      required: [true, 'El código de incidencia es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: INC-001)']
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
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'La persona que reporta la incidencia es obligatoria']
    },
    type: {
      type: String,
      enum: {
        values: ['MERITO', 'DEMERITO', 'ATENCION_PSICOLOGICA', 'CITACION_APODERADO'],
        message: 'Tipo de incidencia no válido'
      },
      required: [true, 'El tipo de incidencia es obligatorio']
    },
    severity: {
      type: String,
      enum: {
        values: ['LEVE', 'MODERADA', 'GRAVE'],
        message: 'Gravedad no válida'
      },
      default: 'LEVE'
    },
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true
    },
    actionTaken: {
      type: String,
      trim: true,
      default: ''
    },
    incidentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: ['ABIERTA', 'EN_SEGUIMIENTO', 'CERRADA'],
        message: 'Estado de incidencia no válido'
      },
      default: 'ABIERTA'
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

export const IncidentModel = mongoose.model<IIncident>('Incident', IncidentSchema, 'incidents');
