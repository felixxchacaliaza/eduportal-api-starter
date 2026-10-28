import mongoose, { Schema, Document, Types } from 'mongoose';

export type AcademicDegreeType = 'LICENCIADO' | 'MAGISTER' | 'DOCTOR' | 'PROFESOR_TITULADO';

export interface ITeacher extends Document {
  id: string;
  code: string;
  person: Types.ObjectId;
  area: Types.ObjectId;
  academicDegree: AcademicDegreeType;
  contractedHours: number;
  assignedHours: number;
  enabled: boolean;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    code: {
      type: String,
      required: [true, 'El código del docente es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: TEA-001)']
    },
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'La persona vinculada es obligatoria'],
      unique: true
    },
    area: {
      type: Schema.Types.ObjectId,
      ref: 'Area',
      required: [true, 'El área curricular de especialidad es obligatoria']
    },
    academicDegree: {
      type: String,
      enum: {
        values: ['LICENCIADO', 'MAGISTER', 'DOCTOR', 'PROFESOR_TITULADO'],
        message: 'Grado académico no válido'
      },
      default: 'LICENCIADO'
    },
    contractedHours: {
      type: Number,
      required: [true, 'Las horas contratadas son obligatorias'],
      min: [1, 'Debe contratar al menos 1 hora'],
      max: [40, 'No puede superar las 40 horas pedagógicas'],
      default: 30
    },
    assignedHours: {
      type: Number,
      default: 0,
      min: [0, 'Las horas asignadas no pueden ser negativas']
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

export const TeacherModel = mongoose.model<ITeacher>('Teacher', TeacherSchema, 'teachers');
