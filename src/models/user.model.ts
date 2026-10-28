import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  id: string;
  code: string;
  person: Types.ObjectId;
  profile: Types.ObjectId;
  email: string;
  password?: string;
  isProtected: boolean;
  lastLogin: Date | null;
  enabled: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    code: {
      type: String,
      required: [true, 'El código del usuario es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: USR-001)']
    },
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'La persona vinculada es obligatoria'],
      unique: true
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'El perfil de acceso es obligatorio']
    },
    email: {
      type: String,
      required: [true, 'El correo de acceso es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Correo no válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    isProtected: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.password;
        return ret;
      }
    }
  }
);

// Hash de contraseña automático antes de guardar
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Método de comparación de contraseña
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema, 'users');
