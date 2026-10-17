import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
}

const SectionSchema = new Schema<ISection>(
  {
    code: {
      type: String,
      required: [true, 'El código de la sección es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [7, 'El código debe tener exactamente 7 caracteres (ej: SEC-001)'],
      maxlength: [7, 'El código debe tener exactamente 7 caracteres (ej: SEC-001)'],
      match: [
        /^[A-Z]{3}-\d{3}$/,
        'El código debe tener las 3 primeras letras en mayúscula, un guión y un número de 3 dígitos (ej: SEC-001)'
      ]
    },
    name: {
      type: String,
      required: [true, 'El nombre de la sección es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [1, 'El nombre de la sección debe tener al menos 1 letra'],
      maxlength: [3, 'El nombre de la sección puede tener como máximo 3 letras (ej: A, B, AA, AB, ABC)'],
      match: [
        /^[A-Z]{1,3}$/,
        'El nombre de la sección debe contener exclusivamente de 1 a 3 letras mayúsculas del alfabeto (ej: A, B, AA, AB, ABC)'
      ]
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'La descripción no puede exceder los 100 caracteres']
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

export const SectionModel = mongoose.model<ISection>('Section', SectionSchema, 'sections');
