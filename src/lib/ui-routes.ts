export const HIDDEN_CART_PREFIXES = ['/admin', '/login'] as const;
export const HIDDEN_WHATSAPP_PREFIXES = ['/admin', '/login', '/cotizacion'] as const;

export function shouldHideFloatingCart(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  return HIDDEN_CART_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function shouldHideWhatsAppFloat(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  return HIDDEN_WHATSAPP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
