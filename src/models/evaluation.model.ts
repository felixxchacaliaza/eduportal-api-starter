import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPeriodEvaluationSubdoc {
  period: number;
  score: number | null;
}

export type EvaluationStatus = 'EN_CURSO' | 'APROBADO' | 'DESAPROBADO';

export interface IEvaluation extends Document {
  id: string;
  code: string;
  enrollment: Types.ObjectId;
  student: Types.ObjectId;
  subject: Types.ObjectId;
  gradeSection: Types.ObjectId;
  teacher: Types.ObjectId;
  academicYear: string;
  periods: IPeriodEvaluationSubdoc[];
  finalAverage: number | null;
  status: EvaluationStatus;
  observation?: string;
  enabled: boolean;
}

const PeriodEvaluationSubdocSchema = new Schema<IPeriodEvaluationSubdoc>(
  {
    period: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },
    score: {
      type: Number,
      min: 0,
      max: 20,
      default: null
    }
  },
  { _id: false }
);

const EvaluationSchema = new Schema<IEvaluation>(
  {
    code: {
      type: String,
      required: [true, 'El código de evaluación es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: EVA-001)']
    },
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'La matrícula es obligatoria']
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'El estudiante es obligatorio']
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'La asignatura es obligatoria']
    },
    gradeSection: {
      type: Schema.Types.ObjectId,
      ref: 'GradeSection',
      required: [true, 'El salón es obligatorio']
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'El docente es obligatorio']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo es obligatorio'],
      match: [/^\d{4}$/, 'El año lectivo debe tener 4 dígitos']
    },
    periods: {
      type: [PeriodEvaluationSubdocSchema],
      default: []
    },
    finalAverage: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['EN_CURSO', 'APROBADO', 'DESAPROBADO'],
        message: 'Estado no válido'
      },
      default: 'EN_CURSO'
    },
    observation: {
      type: String,
      trim: true,
      default: ''
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

// Índice compuesto único: 1 acta por estudiante, materia y año lectivo
EvaluationSchema.index(
  { student: 1, subject: 1, academicYear: 1 },
  { unique: true }
);

export const EvaluationModel = mongoose.model<IEvaluation>('Evaluation', EvaluationSchema, 'evaluations');
