'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type CartItem = {
  id: string | number;
  nombre: string;
  precio: string;
  cantidad: number;
  categoria: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  replaceItems: (nextItems: CartItem[]) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

const DEFAULT_STORAGE_KEY = 'moncasa-cart:guest';

function getStoredCart(storageKey: string): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  storageKey = DEFAULT_STORAGE_KEY,
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [items, setItems] = useState<CartItem[]>(() => getStoredCart(storageKey));
  const previousStorageKeyRef = useRef(storageKey);

  useEffect(() => {
    if (previousStorageKeyRef.current === storageKey) {
      return;
    }

    const nextStoredCart = getStoredCart(storageKey);

    if (!nextStoredCart.length) {
      const previousStoredCart = getStoredCart(previousStorageKeyRef.current);

      if (previousStoredCart.length) {
        setItems(previousStoredCart);
        window.localStorage.setItem(storageKey, JSON.stringify(previousStoredCart));
        previousStorageKeyRef.current = storageKey;
        return;
      }
    }

    setItems(nextStoredCart);
    previousStorageKeyRef.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = useCallback((item: Omit<CartItem, 'cantidad'>, cantidad = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        return current.map((i) =>
          i.id === item.id
            ? {
                ...i,
                nombre: item.nombre,
                categoria: item.categoria,
                precio: item.precio,
                cantidad: i.cantidad + cantidad,
              }
            : i,
        );
      }
      return [...current, { ...item, cantidad }];
    });
  }, []);

  const replaceItems = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
  }, []);

  const removeItem = useCallback((id: string | number) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, cantidad } : i)),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + parseFloat(item.precio || '0') * item.cantidad, 0),
    [items],
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, replaceItems, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
