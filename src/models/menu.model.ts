import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenu extends Document {
  id: string;
  code: string;
  key: string;
  label: string;
  icon: string;
  path: string | null;
  parent: Types.ObjectId | null;
  order: number;
  enabled: boolean;
}

const MenuSchema = new Schema<IMenu>(
  {
    code: {
      type: String,
      required: [true, 'El código del menú es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: MEN-001)']
    },
    key: {
      type: String,
      required: [true, 'La clave única del menú es obligatoria'],
      unique: true,
      trim: true,
      uppercase: true
    },
    label: {
      type: String,
      required: [true, 'La etiqueta visual del menú es obligatoria'],
      trim: true
    },
    icon: {
      type: String,
      required: [true, 'El icono Material es obligatorio'],
      trim: true
    },
    path: {
      type: String,
      default: null,
      trim: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      default: null
    },
    order: {
      type: Number,
      required: [true, 'El orden de aparición es obligatorio'],
      default: 1
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

export const MenuModel = mongoose.model<IMenu>('Menu', MenuSchema, 'menus');
