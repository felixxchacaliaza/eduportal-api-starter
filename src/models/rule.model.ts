import mongoose, { Schema, Document } from 'mongoose';

export type RuleDataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY' | 'ARRAY_OBJECT' | 'OBJECT';

export interface IRule extends Document {
  id: string;
  code: string;
  key: string;
  name: string;
  description: string;
  isAnnual: boolean;
  dataType: RuleDataType;
  value: any;
  enabled: boolean;
}

const RuleSchema = new Schema<IRule>(
  {
    code: {
      type: String,
      required: [true, 'El código de la regla es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: RUL-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: RUL-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: RUL-001)'
      ]
    },
    key: {
      type: String,
      required: [true, 'La clave (key) de la regla es obligatoria'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'La clave debe tener al menos 3 caracteres'],
      maxlength: [50, 'La clave no puede exceder 50 caracteres'],
      match: [
        /^[A-Z0-9_]+$/,
        'La clave debe contener solo mayúsculas, números y guiones bajos (ej: CURRENT_ACADEMIC_YEAR)'
      ]
    },
    name: {
      type: String,
      required: [true, 'El nombre de la regla es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'La descripción no puede exceder los 200 caracteres']
    },
    isAnnual: {
      type: Boolean,
      default: false
    },
    dataType: {
      type: String,
      required: [true, 'El tipo de dato (dataType) es obligatorio'],
      enum: {
        values: ['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'ARRAY_OBJECT', 'OBJECT'],
        message: 'Tipo de dato no válido. Use: STRING, NUMBER, BOOLEAN, ARRAY, ARRAY_OBJECT, OBJECT'
      }
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'El valor (value) de la regla es obligatorio']
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

export const RuleModel = mongoose.model<IRule>('Rule', RuleSchema, 'rules');
