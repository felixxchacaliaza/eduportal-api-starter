import mongoose, { Schema, Document } from 'mongoose';

export type DepartmentType =
  | 'DIRECCION'
  | 'ADMINISTRACION'
  | 'PSICOPEDAGOGIA'
  | 'CONVIVENCIA'
  | 'SERVICIOS_GENERALES';

export interface IPosition extends Document {
  id: string;
  code: string;
  name: string;
  department: DepartmentType;
  description?: string;
  enabled: boolean;
}

const PositionSchema = new Schema<IPosition>(
  {
    code: {
      type: String,
      required: [true, 'El código del cargo es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: POS-001)']
    },
    name: {
      type: String,
      required: [true, 'El nombre del cargo es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      enum: {
        values: ['DIRECCION', 'ADMINISTRACION', 'PSICOPEDAGOGIA', 'CONVIVENCIA', 'SERVICIOS_GENERALES'],
        message: 'Departamento no válido'
      },
      required: [true, 'El departamento es obligatorio']
    },
    description: {
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

export const PositionModel = mongoose.model<IPosition>('Position', PositionSchema, 'positions');
