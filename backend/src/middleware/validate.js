const { z } = require('zod');

/**
 * 🛡️ MIDDLEWARE DE VALIDACIÓN (Zod)
 * Valida el body de la petición contra un esquema Zod.
 * Si falla, responde 400 con detalles del error.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos.',
      errors
    });
  }
  req.validatedBody = result.data;
  next();
};

// ─────────────────────────────────────────────────────────────────
// SCHEMAS DE AUTENTICACIÓN
// ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido.' })
    .email('Formato de email inválido.')
    .max(100, 'El email no puede exceder 100 caracteres.'),
  password: z
    .string({ required_error: 'La contraseña es requerida.' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .max(128, 'La contraseña no puede exceder 128 caracteres.')
});

const registerSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido.' })
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede exceder 100 caracteres.'),
  email: z
    .string({ required_error: 'El email es requerido.' })
    .email('Formato de email inválido.')
    .max(100),
  phone: z.string().max(20).optional(),
  documentId: z.string().max(20).optional(),
  role: z.enum(['Estudiante', 'Colaborador', 'Administrador']).default('Estudiante')
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido.' })
    .email('Formato de email inválido.')
    .max(100)
});

const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'El token es requerido.' })
    .min(10, 'Token inválido.'),
  newPassword: z
    .string({ required_error: 'La nueva contraseña es requerida.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(128)
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula.')
    .regex(/[0-9]/, 'Debe contener al menos un número.')
});

// ─────────────────────────────────────────────────────────────────
// SCHEMAS DE CHATBOT
// ─────────────────────────────────────────────────────────────────

const chatbotMessageSchema = z.object({
  text: z
    .string({ required_error: 'El mensaje es requerido.' })
    .min(1, 'El mensaje no puede estar vacío.')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres.'),
  sessionId: z.string().max(100).optional()
});

// ─────────────────────────────────────────────────────────────────
// SCHEMAS DE ALERTAS
// ─────────────────────────────────────────────────────────────────

const createAlertSchema = z.object({
  studentName: z
    .string({ required_error: 'El nombre del estudiante es requerido.' })
    .min(2).max(100),
  studentUsername: z.string().max(100).optional(),
  alertType: z.enum(['Informativa', 'Preventiva', 'Advertencia', 'Critica']),
  description: z
    .string({ required_error: 'La descripción es requerida.' })
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(2000),
  ticketNumber: z.string().max(30).optional(),
  status: z.enum(['Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente']).default('Pendiente')
});

const updateAlertSchema = z.object({
  status: z.enum(['Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente']).optional(),
  assignedTo: z.string().max(100).optional(),
  description: z.string().max(2000).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe proporcionar al menos un campo para actualizar.'
});

const analyzeAlertSchema = z.object({
  studentName: z.string().min(2).max(100).optional(),
  studentUsername: z.string().max(100).optional(),
  mensaje: z
    .string({ required_error: 'El mensaje es requerido.' })
    .min(1).max(2000),
  tipoViolencia: z.string().max(100).optional(),
  esUrgente: z.boolean().optional()
});

// ─────────────────────────────────────────────────────────────────
// SCHEMAS DE USUARIOS (Administración)
// ─────────────────────────────────────────────────────────────────

const createUserAdminSchema = z.object({
  documentId: z.string().min(5).max(20, 'El documento no puede exceder 20 caracteres.'),
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['Estudiante', 'Colaborador', 'Administrador']).default('Estudiante'),
  phone: z.string().max(20).optional(),
  status: z.enum(['Activo', 'Inactivo']).default('Activo')
});

module.exports = {
  validate,
  schemas: {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    chatbotMessageSchema,
    createAlertSchema,
    updateAlertSchema,
    analyzeAlertSchema,
    createUserAdminSchema
  }
};
