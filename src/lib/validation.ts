import { z } from 'zod';

export const productSchema = z.object({
  category: z.string().trim().min(2, 'La categoría debe tener al menos 2 caracteres.'),
  title: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().trim().max(500, 'La descripción no debe superar 500 caracteres.').optional(),
  price: z
    .string()
    .trim()
    .refine((value) => /^(\d+)(\.\d{1,2})?$/.test(value), 'El precio debe ser numérico (ej. 150 o 150.50).'),
  stock: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), 'El stock debe ser un número entero (ej. 25).'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), 'El orden debe ser un número entero (ej. 0, 1, 2).'),
  image_url: z.string().trim().url('La URL de imagen no es válida.').optional().or(z.literal('')),
});

export const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresa tu nombre completo.'),
  email: z.email('Ingresa un email válido.'),
  telefono: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s-]{6,})?$/, 'Ingresa un teléfono válido o déjalo vacío.')
    .optional()
    .or(z.literal('')),
  asunto: z.string().trim().max(80, 'El asunto no debe superar 80 caracteres.').optional(),
  mensaje: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres.').max(1200, 'El mensaje es demasiado largo.'),
});
