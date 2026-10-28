import mongoose, { Schema, Document, Types } from 'mongoose';

export type AccessLevelType = 'FULL' | 'READ_ONLY';

export interface IPermissionSubdoc {
  menu: Types.ObjectId;
  accessLevel: AccessLevelType;
}

export interface IProfile extends Document {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSuperAdmin: boolean;
  isSystem: boolean;
  permissions: IPermissionSubdoc[];
  enabled: boolean;
}

const PermissionSubdocSchema = new Schema<IPermissionSubdoc>(
  {
    menu: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'El menú autorizado es obligatorio']
    },
    accessLevel: {
      type: String,
      enum: {
        values: ['FULL', 'READ_ONLY'],
        message: 'Nivel de acceso no válido (debe ser FULL o READ_ONLY)'
      },
      default: 'FULL'
    }
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    code: {
      type: String,
      required: [true, 'El código del perfil es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: PRF-001)']
    },
    name: {
      type: String,
      required: [true, 'El nombre del perfil es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: [PermissionSubdocSchema],
      default: []
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

export const ProfileModel = mongoose.model<IProfile>('Profile', ProfileSchema, 'profiles');
