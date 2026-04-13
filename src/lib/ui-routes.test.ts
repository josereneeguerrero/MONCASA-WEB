import { describe, expect, it } from 'vitest';
import { shouldHideFloatingCart, shouldHideWhatsAppFloat } from './ui-routes';

describe('ui routes visibility', () => {
  it('oculta carrito en admin y login', () => {
    expect(shouldHideFloatingCart('/admin')).toBe(true);
    expect(shouldHideFloatingCart('/admin/productos')).toBe(true);
    expect(shouldHideFloatingCart('/login')).toBe(true);
    expect(shouldHideFloatingCart('/productos')).toBe(false);
  });

  it('oculta whatsapp en admin, login y cotizacion', () => {
    expect(shouldHideWhatsAppFloat('/admin')).toBe(true);
    expect(shouldHideWhatsAppFloat('/login')).toBe(true);
    expect(shouldHideWhatsAppFloat('/cotizacion')).toBe(true);
    expect(shouldHideWhatsAppFloat('/contacto')).toBe(false);
  });
});
