import mongoose, { Schema, Document, Types } from 'mongoose';

export type GuardianRelationshipType = 'PADRE' | 'MADRE' | 'TUTOR' | 'APODERADO';

export interface IGuardianSubdoc {
  person: Types.ObjectId;
  relationship: GuardianRelationshipType;
  isPrimary: boolean;
}

export interface IStudent extends Document {
  id: string;
  code: string;
  person: Types.ObjectId;
  guardians: IGuardianSubdoc[];
  entryYear: string;
  enabled: boolean;
}

const GuardianSubdocSchema = new Schema<IGuardianSubdoc>(
  {
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'El apoderado debe ser una persona registrada']
    },
    relationship: {
      type: String,
      enum: {
        values: ['PADRE', 'MADRE', 'TUTOR', 'APODERADO'],
        message: 'Parentesco no válido'
      },
      required: [true, 'El parentesco es obligatorio']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    code: {
      type: String,
      required: [true, 'El código del estudiante es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: STU-001)']
    },
    person: {
      type: Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'La persona vinculada es obligatoria'],
      unique: true
    },
    guardians: {
      type: [GuardianSubdocSchema],
      default: []
    },
    entryYear: {
      type: String,
      required: [true, 'El año de ingreso es obligatorio'],
      match: [/^\d{4}$/, 'El año de ingreso debe tener 4 dígitos']
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

export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema, 'students');
