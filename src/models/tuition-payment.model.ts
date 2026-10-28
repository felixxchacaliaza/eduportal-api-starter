import mongoose, { Schema, Document, Types } from 'mongoose';

export type TuitionConcept =
  | 'MATRICULA'
  | 'PENSION_MARZO'
  | 'PENSION_ABRIL'
  | 'PENSION_MAYO'
  | 'PENSION_JUNIO'
  | 'PENSION_JULIO'
  | 'PENSION_AGOSTO'
  | 'PENSION_SETIEMBRE'
  | 'PENSION_OCTUBRE'
  | 'PENSION_NOVIEMBRE'
  | 'PENSION_DICIEMBRE';

export type PaymentMethodType = 'EFECTIVO' | 'TRANSFERENCIA' | 'YAPE_PLIN' | 'TARJETA';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'EXONERADO';

export interface ITuitionPayment extends Document {
  id: string;
  code: string;
  student: Types.ObjectId;
  enrollment: Types.ObjectId;
  academicYear: string;
  concept: TuitionConcept;
  amount: number;
  dueDate: Date;
  paidDate: Date | null;
  paymentMethod: PaymentMethodType | null;
  status: PaymentStatus;
  enabled: boolean;
}

const TuitionPaymentSchema = new Schema<ITuitionPayment>(
  {
    code: {
      type: String,
      required: [true, 'El código de pago es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{3}-\d{3}$/, 'El código debe tener formato AAA-000 (ej: PAY-001)']
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'El estudiante es obligatorio']
    },
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'La matrícula es obligatoria']
    },
    academicYear: {
      type: String,
      required: [true, 'El año lectivo es obligatorio'],
      match: [/^\d{4}$/, 'El año lectivo debe tener 4 dígitos']
    },
    concept: {
      type: String,
      enum: {
        values: [
          'MATRICULA',
          'PENSION_MARZO',
          'PENSION_ABRIL',
          'PENSION_MAYO',
          'PENSION_JUNIO',
          'PENSION_JULIO',
          'PENSION_AGOSTO',
          'PENSION_SETIEMBRE',
          'PENSION_OCTUBRE',
          'PENSION_NOVIEMBRE',
          'PENSION_DICIEMBRE'
        ],
        message: 'Concepto de pago no válido'
      },
      required: [true, 'El concepto es obligatorio']
    },
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0, 'El monto no puede ser negativo']
    },
    dueDate: {
      type: Date,
      required: [true, 'La fecha de vencimiento es obligatoria']
    },
    paidDate: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['EFECTIVO', 'TRANSFERENCIA', 'YAPE_PLIN', 'TARJETA'],
        message: 'Método de pago no válido'
      },
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['PENDIENTE', 'PAGADO', 'VENCIDO', 'EXONERADO'],
        message: 'Estado de pago no válido'
      },
      default: 'PENDIENTE'
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

export const TuitionPaymentModel = mongoose.model<ITuitionPayment>(
  'TuitionPayment',
  TuitionPaymentSchema,
  'tuition_payments'
);
