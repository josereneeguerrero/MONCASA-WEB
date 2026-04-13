import { describe, expect, it } from 'vitest';
import { contactSchema, productSchema } from './validation';

describe('validation schemas', () => {
  it('acepta producto válido', () => {
    const parsed = productSchema.safeParse({
      category: 'Herramientas',
      title: 'Taladro',
      description: 'Potente',
      price: '1250.50',
      stock: '10',
      is_active: true,
      is_featured: false,
      sort_order: '0',
      image_url: 'https://example.com/img.png',
    });

    expect(parsed.success).toBe(true);
  });

  it('rechaza email inválido', () => {
    const parsed = contactSchema.safeParse({
      nombre: 'Juan Perez',
      email: 'correo-invalido',
      telefono: '',
      asunto: 'Consulta',
      mensaje: 'Necesito información de precios',
    });

    expect(parsed.success).toBe(false);
  });
});
