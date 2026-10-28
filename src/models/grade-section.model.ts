import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGradeSection extends Document {
  id: string;
  code: string;
  grade: Types.ObjectId;
  section: Types.ObjectId;
  classroom: Types.ObjectId;
  academicYear: string;
  shift: string;
  maxCapacity: number;
  enrolledStudents: number;
  tutor?: Types.ObjectId;
  enabled: boolean;
}

const GradeSectionSchema = new Schema<IGradeSection>(
  {
    code: {
      type: String,
      required: [true, 'El código del salón (grado-sección) es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: GSE-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: GSE-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener 3 letras mayúsculas, un guión y 3 dígitos (ej: GSE-001)'
      ]
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'El grado escolar (grade) es obligatorio']
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'La sección escolar (section) es obligatoria']
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'El aula física asignada (classroom) es obligatoria']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo (academicYear) es obligatorio'],
      trim: true,
      match: [/^\d{4}$/, 'El año lectivo debe ser un año de 4 dígitos (ej: 2026)']
    },
    shift: {
      type: String,
      required: [true, 'El turno (shift) es obligatorio'],
      trim: true,
      uppercase: true
    },
    maxCapacity: {
      type: Number,
      required: [true, 'La capacidad máxima de matrículas es obligatoria'],
      min: [1, 'La capacidad máxima debe ser de al menos 1 alumno']
    },
    enrolledStudents: {
      type: Number,
      default: 0,
      min: [0, 'El número de alumnos matriculados no puede ser negativo']
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: false,
      default: null
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

// Índice compuesto 1: No repetir el mismo Grado + Sección en el mismo Año Lectivo
GradeSectionSchema.index(
  { grade: 1, section: 1, academicYear: 1 },
  { unique: true }
);

// Índice compuesto 2: No asignar el mismo Aula física dos veces en el mismo Turno y Año Lectivo
GradeSectionSchema.index(
  { classroom: 1, shift: 1, academicYear: 1 },
  { unique: true }
);

export const GradeSectionModel = mongoose.model<IGradeSection>('GradeSection', GradeSectionSchema, 'grade_sections');