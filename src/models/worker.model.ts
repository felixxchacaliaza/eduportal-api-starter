import mongoose, { Schema, Document, Types } from 'mongoose';

export type ShiftType = 'MAÑANA' | 'TARDE' | 'COMPLETO';

export interface IWorker extends Document {
  id: string;
  code: string;
  person: Types.ObjectId;
  position: Types.ObjectId;
  shift: ShiftType;
  hireDate: Date;
  enabled: boolean;
}

const WorkerSchema = new Schema<IWorker>(
  {
    code: {
      type: String,
      required: [true, 'El código del trabajador es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: WRK-001)']
    },
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'La persona vinculada es obligatoria'],
      unique: true
    },
    position: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: [true, 'El cargo institucional es obligatorio']
    },
    shift: {
      type: String,
      enum: {
        values: ['MAÑANA', 'TARDE', 'COMPLETO'],
        message: 'Turno no válido'
      },
      required: [true, 'El turno laboral es obligatorio']
    },
    hireDate: {
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

export const WorkerModel = mongoose.model<IWorker>('Worker', WorkerSchema, 'workers');
