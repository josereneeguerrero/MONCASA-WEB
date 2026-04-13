'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import BrandLogo from '@/components/brand-logo';
import ConfigPanel from '@/components/config-panel';
import { productSchema } from '@/lib/validation';

type Product = {
  id: string | number;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  activo: boolean;
  destacado: boolean;
  orden: string;
  imagen_url: string;
};

type Mensaje = {
  id: string | number;
  nombre: string;
  email: string;
  telefono: string | null;
  asunto: string | null;
  mensaje: string;
  created_at: string;
};

type AuditLog = {
  id: string | number;
  accion: string;
  entidad: string;
  detalle: string;
  usuario_email: string;
  created_at: string;
};

type AdminRole = {
  id: string | number;
  email: string;
  role: AdminRoleValue;
  activo: boolean;
  created_at: string;
};

type AdminBackup = {
  id: string | number;
  nombre: string;
  productos: Product[];
  created_at: string;
  created_by: string;
};

type FormState = {
  category: string;
  title: string;
  description: string;
  price: string;
  stock: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: string;
  image_url: string;
};

type TabType = 'productos' | 'mensajes' | 'auditoria' | 'seguridad' | 'configuracion';
type StatusFilter = 'all' | 'active' | 'inactive' | 'featured' | 'out_of_stock';
type ProductSortMode = 'manual' | 'name' | 'price_desc' | 'price_asc' | 'stock_desc' | 'stock_asc';
type AdminRoleValue = 'owner' | 'admin' | 'editor' | 'viewer';
type AdminRoleFilter = 'all' | AdminRoleValue;
type AdminRoleStatusFilter = 'all' | 'active' | 'inactive';
type DateRangeFilter = {
  from: string;
  to: string;
};

const ADMIN_ROLE_ORDER: AdminRoleValue[] = ['owner', 'admin', 'editor', 'viewer'];
const ADMIN_ROLE_LABELS: Record<AdminRoleValue, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Lector',
};
const ADMIN_ROLE_PRIORITY: Record<AdminRoleValue, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

function normalizeAdminRole(value: string): AdminRoleValue {
  const normalized = value.toLowerCase();

  return ADMIN_ROLE_ORDER.includes(normalized as AdminRoleValue)
    ? (normalized as AdminRoleValue)
    : 'admin';
}

const emptyForm: FormState = {
  category: '',
  title: '',
  description: '',
  price: '',
  stock: '0',
  is_active: true,
  is_featured: false,
  sort_order: '0',
  image_url: '',
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [mainUploadProgress, setMainUploadProgress] = useState(0);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [backups, setBackups] = useState<AdminBackup[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggingProductId, setDraggingProductId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [activeTab, setActiveTab] = useState<TabType>('productos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<ProductSortMode>('manual');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [messageDateFilter, setMessageDateFilter] = useState<DateRangeFilter>({ from: '', to: '' });
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditDateFilter, setAuditDateFilter] = useState<DateRangeFilter>({ from: '', to: '' });
  const [clearingMessages, setClearingMessages] = useState(false);
  const [clearingAuditLogs, setClearingAuditLogs] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | number | null>(null);
  const [deletingAuditId, setDeletingAuditId] = useState<string | number | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRoleValue>('admin');
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRoleFilter>('all');
  const [roleStatusFilter, setRoleStatusFilter] = useState<AdminRoleStatusFilter>('all');
  const [roleActionId, setRoleActionId] = useState<string | number | null>(null);
  const [invitingEmail, setInvitingEmail] = useState<string | null>(null);
  const [backupName, setBackupName] = useState('');

  const productsTable = useMemo(
    () => process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE ?? 'productos',
    [],
  );
  const auditLogsTable = useMemo(() => 'admin_audit_logs', []);
  const rolesTable = useMemo(() => 'admin_roles', []);
  const backupsTable = useMemo(() => 'admin_backups', []);
  const productsBucket = useMemo(
    () => process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET ?? 'productos',
    [],
  );

  const orderedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        if (a.destacado !== b.destacado) {
          return a.destacado ? -1 : 1;
        }

        const orderA = Number.parseInt(a.orden, 10) || 0;
        const orderB = Number.parseInt(b.orden, 10) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return a.nombre.localeCompare(b.nombre, 'es');
      }),
    [products],
  );

  const dashboardStats = useMemo(() => {
    const total = products.length;
    const active = products.filter((product) => product.activo).length;
    const inactive = total - active;
    const featured = products.filter((product) => product.destacado).length;
    const outOfStock = products.filter((product) => (Number.parseInt(product.stock, 10) || 0) <= 0).length;

    return { total, active, inactive, featured, outOfStock };
  }, [products]);

  const normalizedCurrentUserEmail = currentUserEmail.trim().toLowerCase();

  const currentUserRoleRecord = useMemo(
    () =>
      adminRoles.find((roleItem) => roleItem.email.trim().toLowerCase() === normalizedCurrentUserEmail) ?? null,
    [adminRoles, normalizedCurrentUserEmail],
  );

  const currentUserRole = currentUserRoleRecord ? normalizeAdminRole(currentUserRoleRecord.role) : null;
  const currentUserRoleLabel = currentUserRole ? ADMIN_ROLE_LABELS[currentUserRole] : 'Sin rol asignado';
  const currentUserAccessLabel = currentUserRoleRecord?.activo ? 'Acceso activo' : 'Acceso inactivo';
  const canManageRoles = currentUserRole === 'owner';
  const canManageBackups = currentUserRole === 'owner' || currentUserRole === 'admin';

  const filteredAdminRoles = useMemo(() => {
    const query = roleSearchTerm.trim().toLowerCase();

    return [...adminRoles]
      .filter((roleItem) => {
        const matchesSearch =
          !query ||
          roleItem.email.toLowerCase().includes(query) ||
          roleItem.role.toLowerCase().includes(query);
        const matchesRole = roleFilter === 'all' || roleItem.role === roleFilter;
        const matchesStatus =
          roleStatusFilter === 'all' ||
          (roleStatusFilter === 'active' ? roleItem.activo : !roleItem.activo);

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (a.email.trim().toLowerCase() === normalizedCurrentUserEmail) return -1;
        if (b.email.trim().toLowerCase() === normalizedCurrentUserEmail) return 1;

        const rankDiff =
          ADMIN_ROLE_PRIORITY[normalizeAdminRole(b.role)] - ADMIN_ROLE_PRIORITY[normalizeAdminRole(a.role)];
        if (rankDiff !== 0) return rankDiff;

        if (a.activo !== b.activo) {
          return a.activo ? -1 : 1;
        }

        return a.email.localeCompare(b.email, 'es');
      });
  }, [adminRoles, normalizedCurrentUserEmail, roleFilter, roleSearchTerm, roleStatusFilter]);

  const roleSummary = useMemo(() => {
    const total = adminRoles.length;
    const active = adminRoles.filter((roleItem) => roleItem.activo).length;
    const owners = adminRoles.filter((roleItem) => normalizeAdminRole(roleItem.role) === 'owner').length;
    const inactive = total - active;

    return { total, active, inactive, owners };
  }, [adminRoles]);

  const filteredMensajes = useMemo(() => {
    const query = messageSearchTerm.trim().toLowerCase();

    return mensajes.filter((msg) => {
      const createdAt = msg.created_at ? new Date(msg.created_at) : null;
      const createdStamp = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null;
      const dateValue = createdStamp ? createdStamp.toISOString().slice(0, 10) : '';

      const matchesSearch =
        !query ||
        msg.nombre.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        (msg.asunto ?? '').toLowerCase().includes(query) ||
        msg.mensaje.toLowerCase().includes(query);

      const matchesFrom = !messageDateFilter.from || (dateValue && dateValue >= messageDateFilter.from);
      const matchesTo = !messageDateFilter.to || (dateValue && dateValue <= messageDateFilter.to);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [messageDateFilter.from, messageDateFilter.to, messageSearchTerm, mensajes]);

  const groupedMensajes = useMemo(() => {
    const groups = new Map<string, Mensaje[]>();

    filteredMensajes.forEach((msg) => {
      const dateKey = msg.created_at ? new Date(msg.created_at).toLocaleDateString('es-HN') : 'Sin fecha';
      const current = groups.get(dateKey) ?? [];
      current.push(msg);
      groups.set(dateKey, current);
    });

    return Array.from(groups.entries());
  }, [filteredMensajes]);

  const filteredAuditLogs = useMemo(() => {
    const query = auditSearchTerm.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const createdAt = log.created_at ? new Date(log.created_at) : null;
      const createdStamp = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null;
      const dateValue = createdStamp ? createdStamp.toISOString().slice(0, 10) : '';

      const matchesSearch =
        !query ||
        log.accion.toLowerCase().includes(query) ||
        log.entidad.toLowerCase().includes(query) ||
        log.detalle.toLowerCase().includes(query) ||
        log.usuario_email.toLowerCase().includes(query);

      const matchesFrom = !auditDateFilter.from || (dateValue && dateValue >= auditDateFilter.from);
      const matchesTo = !auditDateFilter.to || (dateValue && dateValue <= auditDateFilter.to);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [auditDateFilter.from, auditDateFilter.to, auditSearchTerm, auditLogs]);

  const groupedAuditLogs = useMemo(() => {
    const groups = new Map<string, AuditLog[]>();

    filteredAuditLogs.forEach((log) => {
      const dateKey = log.created_at ? new Date(log.created_at).toLocaleDateString('es-HN') : 'Sin fecha';
      const current = groups.get(dateKey) ?? [];
      current.push(log);
      groups.set(dateKey, current);
    });

    return Array.from(groups.entries());
  }, [filteredAuditLogs]);

  const canReorder =
    !searchTerm.trim() && statusFilter === 'all' && sortMode === 'manual';

  const filteredProducts = useMemo(
    () => {
      const byText = orderedProducts.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.precio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.stock.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      const byStatus = byText.filter((product) => {
        switch (statusFilter) {
          case 'active':
            return product.activo;
          case 'inactive':
            return !product.activo;
          case 'featured':
            return product.destacado;
          case 'out_of_stock':
            return (Number.parseInt(product.stock, 10) || 0) <= 0;
          default:
            return true;
        }
      });

      if (sortMode === 'manual') {
        return byStatus;
      }

      return [...byStatus].sort((a, b) => {
        if (sortMode === 'name') {
          return a.nombre.localeCompare(b.nombre, 'es');
        }

        if (sortMode === 'price_desc') {
          return (Number.parseFloat(b.precio) || 0) - (Number.parseFloat(a.precio) || 0);
        }

        if (sortMode === 'price_asc') {
          return (Number.parseFloat(a.precio) || 0) - (Number.parseFloat(b.precio) || 0);
        }

        if (sortMode === 'stock_desc') {
          return (Number.parseInt(b.stock, 10) || 0) - (Number.parseInt(a.stock, 10) || 0);
        }

        return (Number.parseInt(a.stock, 10) || 0) - (Number.parseInt(b.stock, 10) || 0);
      });
    },
    [orderedProducts, searchTerm, statusFilter, sortMode],
  );

  // UTILIDADES
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      category: product.categoria,
      title: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.stock,
      is_active: product.activo,
      is_featured: product.destacado,
      sort_order: product.orden,
      image_url: product.imagen_url,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const removeImageFromStorage = useCallback(
    async (publicUrl: string) => {
      if (!isSupabaseConfigured || !supabase) {
        return false;
      }

      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!projectUrl || !publicUrl) {
        return false;
      }

      const publicPrefix = `${projectUrl}/storage/v1/object/public/${productsBucket}/`;

      if (!publicUrl.startsWith(publicPrefix)) {
        return false;
      }

      const objectPath = decodeURIComponent(publicUrl.replace(publicPrefix, '').split('?')[0] ?? '');

      if (!objectPath) {
        return false;
      }

      const { error } = await supabase.storage.from(productsBucket).remove([objectPath]);

      return !error;
    },
    [productsBucket],
  );

  const uploadProductImage = useCallback(
    async (event: ChangeEvent<HTMLInputElement>, target: 'create' | 'edit') => {
      const file = event.target.files?.[0];
      if (!file) return;

      const previousImageUrl = target === 'create' ? form.image_url : editForm.image_url;

      const isImage = file.type.startsWith('image/');
      const maxSizeBytes = 5 * 1024 * 1024;

      if (!isImage) {
        setMessage('⚠ Solo se permiten archivos de imagen.');
        event.target.value = '';
        setTimeout(() => setMessage(''), 4000);
        return;
      }

      if (file.size > maxSizeBytes) {
        setMessage('⚠ La imagen debe pesar menos de 5MB.');
        event.target.value = '';
        setTimeout(() => setMessage(''), 4000);
        return;
      }

      if (target === 'create') {
        setUploadingMainImage(true);
        setMainUploadProgress(8);
      } else {
        setUploadingEditImage(true);
        setEditUploadProgress(8);
      }

      const progressTimer = window.setInterval(() => {
        if (target === 'create') {
          setMainUploadProgress((current) => (current >= 90 ? current : current + 8));
        } else {
          setEditUploadProgress((current) => (current >= 90 ? current : current + 8));
        }
      }, 250);

      setMessage('Subiendo imagen...');

      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const safeBaseName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const fileName = `${Date.now()}-${safeBaseName || 'producto'}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(productsBucket)
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        window.clearInterval(progressTimer);
        setMessage(`No se pudo subir la imagen: ${uploadError.message}`);
        if (target === 'create') {
          setUploadingMainImage(false);
          setMainUploadProgress(0);
        } else {
          setUploadingEditImage(false);
          setEditUploadProgress(0);
        }
        event.target.value = '';
        setTimeout(() => setMessage(''), 4000);
        return;
      }

      const { data } = supabase.storage.from(productsBucket).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      if (target === 'create') {
        setForm((current) => ({ ...current, image_url: publicUrl }));
        setUploadingMainImage(false);
        setMainUploadProgress(100);
      } else {
        setEditForm((current) => ({ ...current, image_url: publicUrl }));
        setUploadingEditImage(false);
        setEditUploadProgress(100);
      }

      window.clearInterval(progressTimer);

      if (previousImageUrl && previousImageUrl !== publicUrl) {
        void removeImageFromStorage(previousImageUrl);
      }

      setMessage('✓ Imagen subida correctamente.');
      event.target.value = '';
      setTimeout(() => {
        if (target === 'create') {
          setMainUploadProgress(0);
        } else {
          setEditUploadProgress(0);
        }
      }, 500);
      setTimeout(() => setMessage(''), 4000);
    },
    [productsBucket, form.image_url, editForm.image_url, removeImageFromStorage],
  );

  const loadProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts([]);
      return;
    }

    const { data, error } = await supabase.from(productsTable).select('*').limit(100);

    if (error) {
      setMessage(`No se pudieron cargar los productos: ${error.message}`);
      setProducts([]);
      return;
    }

    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      id: item.id,
      categoria: String(item.categoria ?? ''),
      nombre: String(item.nombre ?? ''),
      descripcion: String(item.descripcion ?? ''),
      precio: String(item.precio ?? ''),
      stock: String(item.stock ?? '0'),
      activo: ['true', '1', 't', 'yes'].includes(
        String(item.activo ?? item.active ?? true).toLowerCase(),
      ),
      destacado: ['true', '1', 't', 'yes'].includes(
        String(item.destacado ?? item.featured ?? false).toLowerCase(),
      ),
      orden: String(item.orden ?? item.sort_order ?? '0'),
      imagen_url: String(item.imagen_url ?? ''),
    }));

    setProducts(normalized);
  }, [productsTable]);

  const loadMensajes = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setMensajes([]);
      return;
    }

    const { data, error } = await supabase
      .from('contactos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      setMessage(`No se pudieron cargar los mensajes: ${error.message}`);
      setMensajes([]);
      return;
    }

    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      id: item.id,
      nombre: String(item.nombre ?? ''),
      email: String(item.email ?? ''),
      telefono: item.telefono ? String(item.telefono) : null,
      asunto: item.asunto ? String(item.asunto) : null,
      mensaje: String(item.mensaje ?? ''),
      created_at: String(item.created_at ?? ''),
    }));

    setMensajes(normalized);
  }, []);

  const loadAuditLogs = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAuditLogs([]);
      return;
    }

    const { data, error } = await supabase
      .from(auditLogsTable)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(80);

    if (error) {
      return;
    }

    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      id: item.id,
      accion: String(item.accion ?? ''),
      entidad: String(item.entidad ?? ''),
      detalle: String(item.detalle ?? ''),
      usuario_email: String(item.usuario_email ?? 'desconocido'),
      created_at: String(item.created_at ?? ''),
    }));

    setAuditLogs(normalized);
  }, [auditLogsTable]);

  const clearMessageFilters = useCallback(() => {
    setMessageSearchTerm('');
    setMessageDateFilter({ from: '', to: '' });
  }, []);

  const clearAuditFilters = useCallback(() => {
    setAuditSearchTerm('');
    setAuditDateFilter({ from: '', to: '' });
  }, []);

  const getAdminRequestHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      return null;
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }, []);

  const loadAdminRoles = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAdminRoles([]);
      return;
    }

    const { data, error } = await supabase
      .from(rolesTable)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return;
    }

    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      id: item.id,
      email: String(item.email ?? ''),
      role: normalizeAdminRole(String(item.role ?? 'admin')),
      activo: ['true', '1', 't', 'yes'].includes(String(item.activo ?? true).toLowerCase()),
      created_at: String(item.created_at ?? ''),
    }));

    setAdminRoles(normalized);
  }, [rolesTable]);

  const loadBackups = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setBackups([]);
      return;
    }

    const { data, error } = await supabase
      .from(backupsTable)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return;
    }

    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      id: item.id,
      nombre: String(item.nombre ?? 'Respaldo sin nombre'),
      productos: Array.isArray(item.productos) ? (item.productos as Product[]) : [],
      created_at: String(item.created_at ?? ''),
      created_by: String(item.created_by ?? 'desconocido'),
    }));

    setBackups(normalized);
  }, [backupsTable]);

  const clearMessage = useCallback(() => {
    setTimeout(() => setMessage(''), 4000);
  }, []);

  const logAudit = useCallback(
    async (accion: string, entidad: string, detalle: string) => {
      if (!currentUserEmail) {
        return;
      }

      const { error } = await supabase.from(auditLogsTable).insert({
        accion,
        entidad,
        detalle,
        usuario_email: currentUserEmail,
      });

      if (!error) {
        await loadAuditLogs();
      }
    },
    [auditLogsTable, currentUserEmail, loadAuditLogs],
  );

  // EFECTOS
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace('/login');
        return;
      }

      setCurrentUserEmail(data.session.user.email ?? '');

      await loadProducts();
      await loadMensajes();
      await loadAuditLogs();
      await loadAdminRoles();
      await loadBackups();
      setLoading(false);
    };

    void load();
  }, [router, loadProducts, loadMensajes, loadAuditLogs, loadAdminRoles, loadBackups]);

  // HANDLERS
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const parsed = productSchema.safeParse(form);

    if (!parsed.success) {
      setMessage(`⚠ ${parsed.error.issues[0]?.message ?? 'Revisa los datos del producto.'}`);
      setSubmitting(false);
      return;
    }

    const payload = {
      categoria: parsed.data.category.trim(),
      nombre: parsed.data.title.trim(),
      descripcion: parsed.data.description?.trim() ?? '',
      precio: parsed.data.price.trim(),
      stock: Number.parseInt(parsed.data.stock, 10),
      activo: parsed.data.is_active,
      destacado: parsed.data.is_featured,
      orden: Number.parseInt(parsed.data.sort_order, 10),
      imagen_url: parsed.data.image_url?.trim() ?? '',
    };

    const { error } = await supabase.from(productsTable).insert(payload);

    if (error) {
      const messageText = error.message.toLowerCase();
      if (
        messageText.includes('stock') ||
        messageText.includes('activo') ||
        messageText.includes('destacado') ||
        messageText.includes('orden')
      ) {
        setMessage('No se pudo guardar: faltan columnas nuevas (stock/activo/destacado/orden) en Supabase.');
        setSubmitting(false);
        return;
      }
      setMessage(`No se pudo guardar el producto: ${error.message}`);
      setSubmitting(false);
      return;
    }

    setForm(emptyForm);
    await loadProducts();
    setMessage('✓ Producto agregado correctamente.');
    void logAudit('crear', 'producto', `Se creó: ${payload.nombre}`);
    clearMessage();
    setSubmitting(false);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;

    setSubmitting(true);
    setMessage('');

    const parsed = productSchema.safeParse(editForm);

    if (!parsed.success) {
      setMessage(`⚠ ${parsed.error.issues[0]?.message ?? 'Revisa los datos del producto.'}`);
      setSubmitting(false);
      return;
    }

    const payload = {
      categoria: parsed.data.category.trim(),
      nombre: parsed.data.title.trim(),
      descripcion: parsed.data.description?.trim() ?? '',
      precio: parsed.data.price.trim(),
      stock: Number.parseInt(parsed.data.stock, 10),
      activo: parsed.data.is_active,
      destacado: parsed.data.is_featured,
      orden: Number.parseInt(parsed.data.sort_order, 10),
      imagen_url: parsed.data.image_url?.trim() ?? '',
    };

    const { error } = await supabase.from(productsTable).update(payload).eq('id', editingId);

    if (error) {
      const messageText = error.message.toLowerCase();
      if (
        messageText.includes('stock') ||
        messageText.includes('activo') ||
        messageText.includes('destacado') ||
        messageText.includes('orden')
      ) {
        setMessage('No se pudo actualizar: faltan columnas nuevas (stock/activo/destacado/orden) en Supabase.');
        setSubmitting(false);
        return;
      }
      setMessage(`No se pudo actualizar el producto: ${error.message}`);
      setSubmitting(false);
      return;
    }

    await loadProducts();
    setMessage('✓ Producto actualizado correctamente.');
    void logAudit('actualizar', 'producto', `Se actualizó: ${payload.nombre}`);
    cancelEdit();
    clearMessage();
    setSubmitting(false);
  }

  async function handleDelete(productId: string | number) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    setDeleting(productId);
    const { error } = await supabase.from(productsTable).delete().eq('id', productId);

    if (error) {
      setMessage(`No se pudo eliminar el producto: ${error.message}`);
      setDeleting(null);
      return;
    }

    await loadProducts();
    setMessage('✓ Producto eliminado correctamente.');
    void logAudit('eliminar', 'producto', `Se eliminó ID ${productId}`);
    clearMessage();
    setDeleting(null);
  }

  async function handleClearAll() {
    if (!window.confirm('¿Seguro que deseas vaciar todo el catálogo? Esta acción no se puede deshacer.')) {
      return;
    }

    const verification = window.prompt(
      'Para confirmar, escribe VACIAR en mayúsculas y presiona Aceptar.',
    );

    if (verification !== 'VACIAR') {
      setMessage('Acción cancelada. Debes escribir VACIAR exactamente para continuar.');
      clearMessage();
      return;
    }

    setSubmitting(true);
    setMessage('');

    const { error } = await supabase.from(productsTable).delete().neq('id', -1);

    if (error) {
      setMessage(`No se pudo vaciar el catálogo: ${error.message}`);
      setSubmitting(false);
      return;
    }

    await loadProducts();
    setMessage('✓ Catálogo vaciado correctamente.');
    void logAudit('vaciar', 'catalogo', 'Se vació completamente el catálogo.');
    clearMessage();
    setSubmitting(false);
  }

  async function handleToggleActive(product: Product) {
    const nextValue = !product.activo;

    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, activo: nextValue } : item)),
    );

    const { error } = await supabase
      .from(productsTable)
      .update({ activo: nextValue })
      .eq('id', product.id);

    if (error) {
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, activo: product.activo } : item)),
      );
      setMessage(`No se pudo cambiar estado activo: ${error.message}`);
      clearMessage();
      return;
    }

    setMessage(nextValue ? '✓ Producto activado.' : '✓ Producto desactivado.');
    void logAudit(
      'estado',
      'producto',
      `${nextValue ? 'Activado' : 'Desactivado'}: ${product.nombre}`,
    );
    clearMessage();
  }

  async function handleToggleFeatured(product: Product) {
    const nextValue = !product.destacado;

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, destacado: nextValue }
          : item,
      ),
    );

    const { error } = await supabase
      .from(productsTable)
      .update({ destacado: nextValue })
      .eq('id', product.id);

    if (error) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, destacado: product.destacado }
            : item,
        ),
      );
      setMessage(`No se pudo cambiar destacado: ${error.message}`);
      clearMessage();
      return;
    }

    setMessage(nextValue ? '✓ Producto marcado como destacado.' : '✓ Producto quitado de destacados.');
    void logAudit(
      'destacado',
      'producto',
      `${nextValue ? 'Destacado' : 'No destacado'}: ${product.nombre}`,
    );
    clearMessage();
  }

  function handleExportCsv() {
    const headers = [
      'id',
      'categoria',
      'nombre',
      'descripcion',
      'precio',
      'stock',
      'activo',
      'destacado',
      'orden',
      'imagen_url',
    ];

    const rows = orderedProducts.map((product) => [
      product.id,
      product.categoria,
      product.nombre,
      product.descripcion,
      product.precio,
      product.stock,
      product.activo ? 'true' : 'false',
      product.destacado ? 'true' : 'false',
      product.orden,
      product.imagen_url,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `productos-admin-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage('✓ CSV exportado correctamente.');
    clearMessage();
  }

  async function handleAddAdminRole() {
    if (!canManageRoles) {
      setMessage('Solo el propietario puede agregar o modificar roles.');
      clearMessage();
      return;
    }

    const email = newAdminEmail.trim().toLowerCase();

    if (!email) {
      setMessage('Ingresa un correo para agregar al panel de roles.');
      clearMessage();
      return;
    }

    const payload = {
      email,
      role: normalizeAdminRole(newAdminRole),
      activo: true,
    };

    const { error } = await supabase.from(rolesTable).upsert(payload, { onConflict: 'email' });

    if (error) {
      setMessage(`No se pudo guardar el rol: ${error.message}`);
      clearMessage();
      return;
    }

    setNewAdminEmail('');
    setNewAdminRole('admin');
    await loadAdminRoles();
    void logAudit('rol', 'admin', `Se asignó rol ${payload.role} a ${payload.email}`);
    setMessage('✓ Rol guardado correctamente.');
    clearMessage();
  }

  async function handleUpdateAdminRole(roleItem: AdminRole, nextRole: AdminRoleValue) {
    if (!canManageRoles) {
      setMessage('Solo el propietario puede cambiar roles.');
      clearMessage();
      return;
    }

    if (roleItem.email.trim().toLowerCase() === normalizedCurrentUserEmail) {
      setMessage('No puedes cambiar tu propio rango desde aquí.');
      clearMessage();
      return;
    }

    setRoleActionId(roleItem.id);

    const { error } = await supabase
      .from(rolesTable)
      .update({ role: nextRole, activo: true })
      .eq('id', roleItem.id);

    if (error) {
      setRoleActionId(null);
      setMessage(`No se pudo cambiar el rol: ${error.message}`);
      clearMessage();
      return;
    }

    await loadAdminRoles();
    void logAudit('rol', 'admin', `Se cambió ${roleItem.email} a rol ${nextRole}`);
    setMessage(`✓ Rol actualizado a ${ADMIN_ROLE_LABELS[nextRole]}.`);
    setRoleActionId(null);
    clearMessage();
  }

  async function handleToggleRoleActive(roleItem: AdminRole) {
    if (!canManageRoles) {
      setMessage('Solo el propietario puede activar o desactivar accesos.');
      clearMessage();
      return;
    }

    if (roleItem.email.trim().toLowerCase() === normalizedCurrentUserEmail) {
      setMessage('No puedes desactivar tu propio acceso desde aquí.');
      clearMessage();
      return;
    }

    const ownerCount = adminRoles.filter(
      (item) => normalizeAdminRole(item.role) === 'owner' && item.activo,
    ).length;

    if (normalizeAdminRole(roleItem.role) === 'owner' && roleItem.activo && ownerCount <= 1) {
      setMessage('No puedes desactivar al último propietario activo.');
      clearMessage();
      return;
    }

    setRoleActionId(roleItem.id);

    const nextValue = !roleItem.activo;

    const { error } = await supabase
      .from(rolesTable)
      .update({ activo: nextValue })
      .eq('id', roleItem.id);

    if (error) {
      setRoleActionId(null);
      setMessage(`No se pudo actualizar estado de rol: ${error.message}`);
      clearMessage();
      return;
    }

    await loadAdminRoles();
    void logAudit(
      'rol',
      'admin',
      `${nextValue ? 'Se activó' : 'Se desactivó'} acceso para ${roleItem.email}`,
    );
    setMessage('✓ Estado de rol actualizado.');
    setRoleActionId(null);
    clearMessage();
  }

  async function handleRemoveAdminRole(roleItem: AdminRole) {
    if (!canManageRoles) {
      setMessage('Solo el propietario puede eliminar accesos.');
      clearMessage();
      return;
    }

    if (roleItem.email.trim().toLowerCase() === normalizedCurrentUserEmail) {
      setMessage('No puedes eliminar tu propio acceso desde aquí.');
      clearMessage();
      return;
    }

    const ownerCount = adminRoles.filter((item) => normalizeAdminRole(item.role) === 'owner').length;

    if (normalizeAdminRole(roleItem.role) === 'owner' && ownerCount <= 1) {
      setMessage('No puedes eliminar al último propietario.');
      clearMessage();
      return;
    }

    if (!window.confirm(`¿Eliminar el acceso de ${roleItem.email}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setRoleActionId(roleItem.id);

    const { error } = await supabase.from(rolesTable).delete().eq('id', roleItem.id);

    if (error) {
      setRoleActionId(null);
      setMessage(`No se pudo eliminar el acceso: ${error.message}`);
      clearMessage();
      return;
    }

    await loadAdminRoles();
    void logAudit('rol', 'admin', `Se eliminó el acceso de ${roleItem.email}`);
    setMessage('✓ Acceso eliminado correctamente.');
    setRoleActionId(null);
    clearMessage();
  }

  async function handleInviteAccess(emailInput: string) {
    if (!canManageRoles) {
      setMessage('Solo el propietario puede enviar invitaciones.');
      clearMessage();
      return;
    }

    const email = emailInput.trim().toLowerCase();

    if (!email) {
      setMessage('Ingresa un correo válido para enviar invitación.');
      clearMessage();
      return;
    }

    setInvitingEmail(email);

    const headers = await getAdminRequestHeaders();

    if (!headers) {
      setMessage('Debes iniciar sesión de nuevo para enviar invitaciones.');
      setInvitingEmail(null);
      clearMessage();
      return;
    }

    const response = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? 'No se pudo enviar la invitación.');
      setInvitingEmail(null);
      clearMessage();
      return;
    }

    void logAudit('rol', 'admin', `Se envió invitación de acceso a ${email}`);
    setMessage(`✓ Invitación enviada a ${email}. Debe revisar su correo para aceptar el acceso.`);
    setInvitingEmail(null);
    clearMessage();
  }

  async function handleCreateBackup() {
    if (!canManageBackups) {
      setMessage('Solo owner o admin pueden crear respaldos.');
      clearMessage();
      return;
    }

    const trimmedName = backupName.trim();
    const snapshotName =
      trimmedName || `Backup ${new Date().toLocaleDateString('es-HN')} ${new Date().toLocaleTimeString('es-HN')}`;

    const snapshotProducts = orderedProducts.map((product) => ({
      categoria: product.categoria,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      activo: product.activo,
      destacado: product.destacado,
      orden: product.orden,
      imagen_url: product.imagen_url,
    }));

    const { error } = await supabase.from(backupsTable).insert({
      nombre: snapshotName,
      productos: snapshotProducts,
      created_by: currentUserEmail || 'desconocido',
    });

    if (error) {
      setMessage(`No se pudo crear respaldo: ${error.message}`);
      clearMessage();
      return;
    }

    setBackupName('');
    await loadBackups();
    void logAudit('backup', 'catalogo', `Se creó respaldo: ${snapshotName}`);
    setMessage('✓ Respaldo creado correctamente.');
    clearMessage();
  }

  async function handleRestoreBackup(backup: AdminBackup) {
    if (!canManageBackups) {
      setMessage('Solo owner o admin pueden restaurar respaldos.');
      clearMessage();
      return;
    }

    if (
      !window.confirm(
        `¿Restaurar respaldo "${backup.nombre}"? El catálogo actual será reemplazado por este snapshot.`,
      )
    ) {
      return;
    }

    setRestoringBackup(true);

    const { error: clearError } = await supabase.from(productsTable).delete().neq('id', -1);

    if (clearError) {
      setMessage(`No se pudo limpiar catálogo para restaurar: ${clearError.message}`);
      setRestoringBackup(false);
      clearMessage();
      return;
    }

    if (backup.productos.length > 0) {
      const payload = backup.productos.map((item) => ({
        categoria: item.categoria,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        stock: Number.parseInt(String(item.stock), 10) || 0,
        activo: Boolean(item.activo),
        destacado: Boolean(item.destacado),
        orden: Number.parseInt(String(item.orden), 10) || 0,
        imagen_url: item.imagen_url,
      }));

      const { error: insertError } = await supabase.from(productsTable).insert(payload);

      if (insertError) {
        setMessage(`No se pudo restaurar respaldo: ${insertError.message}`);
        setRestoringBackup(false);
        clearMessage();
        return;
      }
    }

    await loadProducts();
    void logAudit('restore', 'catalogo', `Se restauró respaldo: ${backup.nombre}`);
    setMessage(`✓ Respaldo restaurado: ${backup.nombre}`);
    setRestoringBackup(false);
    clearMessage();
  }

  async function handleClearMessages() {
    if (!window.confirm('¿Borrar todos los mensajes de contacto? Esta acción no se puede deshacer.')) {
      return;
    }

    setClearingMessages(true);

    const headers = await getAdminRequestHeaders();

    if (!headers) {
      setMessage('Debes iniciar sesión de nuevo para limpiar mensajes.');
      setClearingMessages(false);
      clearMessage();
      return;
    }

    const response = await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? 'No se pudieron borrar los mensajes.');
      setClearingMessages(false);
      clearMessage();
      return;
    }

    await loadMensajes();
    clearMessageFilters();
    setMessage('✓ Mensajes limpiados correctamente.');
    void logAudit('limpieza', 'mensajes', 'Se limpiaron todos los mensajes de contacto.');
    setClearingMessages(false);
    clearMessage();
  }

  async function handleClearAuditLogs() {
    if (!window.confirm('¿Borrar toda la auditoría? Esta acción no se puede deshacer.')) {
      return;
    }

    setClearingAuditLogs(true);

    const headers = await getAdminRequestHeaders();

    if (!headers) {
      setMessage('Debes iniciar sesión de nuevo para limpiar auditoría.');
      setClearingAuditLogs(false);
      clearMessage();
      return;
    }

    const response = await fetch('/api/admin/audit', {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? 'No se pudo borrar la auditoría.');
      setClearingAuditLogs(false);
      clearMessage();
      return;
    }

    await loadAuditLogs();
    clearAuditFilters();
    setMessage('✓ Auditoría limpiada correctamente.');
    setClearingAuditLogs(false);
    clearMessage();
  }

  async function handleDeleteMessage(messageItem: Mensaje) {
    if (!window.confirm(`¿Eliminar el mensaje de ${messageItem.nombre}?`)) {
      return;
    }

    setDeletingMessageId(messageItem.id);

    const headers = await getAdminRequestHeaders();

    if (!headers) {
      setMessage('Debes iniciar sesión de nuevo para borrar mensajes.');
      setDeletingMessageId(null);
      clearMessage();
      return;
    }

    const response = await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: messageItem.id }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? 'No se pudo borrar el mensaje.');
      setDeletingMessageId(null);
      clearMessage();
      return;
    }

    await loadMensajes();
    setMessage('✓ Mensaje eliminado correctamente.');
    setDeletingMessageId(null);
    clearMessage();
  }

  async function handleDeleteAuditLog(logItem: AuditLog) {
    if (!window.confirm('¿Eliminar este evento de auditoría?')) {
      return;
    }

    setDeletingAuditId(logItem.id);

    const headers = await getAdminRequestHeaders();

    if (!headers) {
      setMessage('Debes iniciar sesión de nuevo para borrar auditoría.');
      setDeletingAuditId(null);
      clearMessage();
      return;
    }

    const response = await fetch('/api/admin/audit', {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: logItem.id }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? 'No se pudo borrar la auditoría.');
      setDeletingAuditId(null);
      clearMessage();
      return;
    }

    await loadAuditLogs();
    setMessage('✓ Evento de auditoría eliminado correctamente.');
    setDeletingAuditId(null);
    clearMessage();
  }

  function handleDragStart(productId: string | number) {
    if (!canReorder) {
      setMessage('Para reordenar: limpia búsqueda, usa filtro "Todos" y orden "Manual".');
      clearMessage();
      return;
    }

    setDraggingProductId(productId);
  }

  function handleDrop(targetId: string | number) {
    if (!draggingProductId || draggingProductId === targetId) {
      return;
    }

    if (!canReorder) {
      setDraggingProductId(null);
      return;
    }

    const ids = orderedProducts.map((product) => String(product.id));
    const fromIndex = ids.indexOf(String(draggingProductId));
    const toIndex = ids.indexOf(String(targetId));

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingProductId(null);
      return;
    }

    const reorderedIds = [...ids];
    const [moved] = reorderedIds.splice(fromIndex, 1);
    reorderedIds.splice(toIndex, 0, moved);

    const orderMap = new Map(reorderedIds.map((id, index) => [id, index]));

    setProducts((current) =>
      current.map((product) => ({
        ...product,
        orden: String(orderMap.get(String(product.id)) ?? Number.parseInt(product.orden, 10) ?? 0),
      })),
    );

    setDraggingProductId(null);
  }

  async function handleSaveOrder() {
    if (!canReorder) {
      setMessage('Para guardar orden: limpia búsqueda, usa filtro "Todos" y orden "Manual".');
      clearMessage();
      return;
    }

    setSavingOrder(true);

    const updates = orderedProducts.map((product, index) => ({
      id: product.id,
      orden: Number.parseInt(product.orden, 10) || index,
    }));

    const results = await Promise.all(
      updates.map(({ id, orden }) => supabase.from(productsTable).update({ orden }).eq('id', id)),
    );

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      setMessage(`No se pudo guardar el orden: ${failed.error.message}`);
      setSavingOrder(false);
      return;
    }

    await loadProducts();
    setMessage('✓ Orden guardado correctamente.');
    void logAudit('ordenar', 'catalogo', 'Se guardó nuevo orden manual de productos.');
    clearMessage();
    setSavingOrder(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] text-[var(--color-moncasa-text)]">
        <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-6 py-4 text-[#FE9A01]">
            Cargando acceso...
          </div>
        </section>
      </main>
    );
  }

  // JSX
  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-2 py-2 text-[var(--color-moncasa-text)] sm:px-4 sm:py-4 lg:px-6">
      <div className="mx-auto min-h-[calc(100vh-1rem)] max-w-7xl overflow-hidden rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_20px_70px_var(--color-moncasa-shadow)] sm:min-h-[calc(100vh-2rem)] sm:rounded-[2rem]">
        {/* HEADER */}
        <header className="border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
              <div className="min-w-0 leading-tight">
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#FE9A01] sm:text-[10px] sm:tracking-[0.35em]">FERRETERIA MONCASA</p>
                <p className="text-sm text-[var(--color-moncasa-muted)]">Panel de control</p>
              </div>
            </Link>

            <div className="flex w-full flex-wrap gap-2 text-sm font-semibold text-[var(--color-moncasa-text-weak)] lg:w-auto lg:justify-end">
              <div className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-3 py-2 text-xs text-[var(--color-moncasa-muted)] sm:w-auto sm:rounded-full sm:px-4">
                <span className="break-all font-bold text-[var(--color-moncasa-text)]">{currentUserEmail || 'Sin sesión'}</span>
                <span className="mx-2 text-[var(--color-moncasa-muted-strong)]">·</span>
                <span>{currentUserRoleLabel}</span>
              </div>
              <Link href="/productos" className="w-full rounded-full border border-[var(--color-moncasa-border)] px-4 py-2 text-center transition hover:bg-[var(--color-moncasa-hover)] sm:w-auto">
                Ver catálogo
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.replace('/login');
                }}
                className="w-full rounded-full bg-[#FE9A01] px-4 py-2 text-center font-bold text-[#0A1116] transition hover:brightness-95 sm:w-auto"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="flex overflow-x-auto border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)]">
          <button
            type="button"
            onClick={() => setActiveTab('productos')}
            className={`whitespace-nowrap px-4 py-3 text-center text-sm font-bold transition sm:px-6 sm:py-4 ${
              activeTab === 'productos'
                ? 'border-b-2 border-[#FE9A01] text-[#FE9A01]'
                : 'text-[var(--color-moncasa-muted)] hover:text-[var(--color-moncasa-text)]'
            }`}
          >
            Productos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mensajes')}
            className={`whitespace-nowrap px-4 py-3 text-center text-sm font-bold transition sm:px-6 sm:py-4 ${
              activeTab === 'mensajes'
                ? 'border-b-2 border-[#FE9A01] text-[#FE9A01]'
                : 'text-[var(--color-moncasa-muted)] hover:text-[var(--color-moncasa-text)]'
            }`}
          >
            Mensajes ({mensajes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auditoria')}
            className={`whitespace-nowrap px-4 py-3 text-center text-sm font-bold transition sm:px-6 sm:py-4 ${
              activeTab === 'auditoria'
                ? 'border-b-2 border-[#FE9A01] text-[#FE9A01]'
                : 'text-[var(--color-moncasa-muted)] hover:text-[var(--color-moncasa-text)]'
            }`}
          >
            Auditoría ({auditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('configuracion')}
            className={`whitespace-nowrap px-4 py-3 text-center text-sm font-bold transition sm:px-6 sm:py-4 ${
              activeTab === 'configuracion'
                ? 'border-b-2 border-[#FE9A01] text-[#FE9A01]'
                : 'text-[var(--color-moncasa-muted)] hover:text-[var(--color-moncasa-text)]'
            }`}
          >
            Configuración
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seguridad')}
            className={`whitespace-nowrap px-4 py-3 text-center text-sm font-bold transition sm:px-6 sm:py-4 ${
              activeTab === 'seguridad'
                ? 'border-b-2 border-[#FE9A01] text-[#FE9A01]'
                : 'text-[var(--color-moncasa-muted)] hover:text-[var(--color-moncasa-text)]'
            }`}
          >
            Seguridad y respaldos
          </button>
        </div>

        {/* MODAL DE EDICIÓN */}
        {editingId !== null && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-3 py-4 sm:items-center sm:px-4 sm:py-6">
            <div className="flex w-full max-w-md max-h-[calc(100vh-2rem)] flex-col rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-5 sm:max-h-[90vh] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[var(--color-moncasa-text)]">Editar producto</h2>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-[var(--color-moncasa-muted)] transition hover:text-[var(--color-moncasa-text)]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="flex-1 space-y-3 overflow-y-auto pr-1">
                <details open className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-3">
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#FE9A01]">
                    Datos básicos
                  </summary>
                  <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Categoría
                </label>
                <input
                  value={editForm.category}
                  onChange={(e) => setEditForm((c) => ({ ...c, category: e.target.value }))}
                  placeholder="Categoría"
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Nombre del producto
                </label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((c) => ({ ...c, title: e.target.value }))}
                  placeholder="Nombre"
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Descripción"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Precio unitario (L)
                </label>
                <input
                  value={editForm.price}
                  onChange={(e) => setEditForm((c) => ({ ...c, price: e.target.value }))}
                  placeholder="Precio (L)"
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                  </div>
                </details>
                <details className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-3">
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#FE9A01]">
                    Inventario y visibilidad
                  </summary>
                  <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Inventario (unidades)
                </label>
                <input
                  value={editForm.stock}
                  onChange={(e) => setEditForm((c) => ({ ...c, stock: e.target.value }))}
                  placeholder="Stock (unidades)"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Orden manual
                </label>
                <input
                  value={editForm.sort_order}
                  onChange={(e) => setEditForm((c) => ({ ...c, sort_order: e.target.value }))}
                  placeholder="Orden manual (0 primero)"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <p className="-mt-1 text-xs text-[var(--color-moncasa-muted)]">Menor número = más arriba en el catálogo.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)]">
                    <input
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm((c) => ({ ...c, is_active: e.target.checked }))}
                    />
                    Activo (visible en catálogo)
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)]">
                    <input
                      type="checkbox"
                      checked={editForm.is_featured}
                      onChange={(e) => setEditForm((c) => ({ ...c, is_featured: e.target.checked }))}
                    />
                    Destacado (aparece primero)
                  </label>
                </div>
                  </div>
                </details>
                <details className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-3">
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#FE9A01]">
                    Imagen
                  </summary>
                  <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Imagen del producto
                </label>
                <input
                  value={editForm.image_url}
                  onChange={(e) => setEditForm((c) => ({ ...c, image_url: e.target.value }))}
                  placeholder="URL imagen"
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <div className="rounded-xl border border-dashed border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] p-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                    Subir o reemplazar imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      void uploadProductImage(event, 'edit');
                    }}
                    disabled={uploadingEditImage}
                    className="w-full text-xs text-[var(--color-moncasa-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[#FE9A01]/20 file:px-3 file:py-2 file:font-semibold file:text-[#FE9A01] hover:file:bg-[#FE9A01]/30"
                  />
                  <p className="mt-2 text-xs text-[var(--color-moncasa-muted)]">
                    {uploadingEditImage ? 'Subiendo imagen...' : 'PNG, JPG o WEBP (max 5MB).'}
                  </p>
                  {(uploadingEditImage || editUploadProgress > 0) && (
                    <div className="mt-2">
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-moncasa-surface-soft)]">
                        <div
                          className="h-full rounded-full bg-[#FE9A01] transition-all duration-300"
                          style={{ width: `${editUploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--color-moncasa-muted)]">{editUploadProgress}%</p>
                    </div>
                  )}
                </div>

                {editForm.image_url ? (
                  <div className="space-y-2">
                    <Image
                      src={editForm.image_url}
                      alt="Vista previa"
                      width={640}
                      height={256}
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 640px"
                      className="h-32 w-full rounded-xl border border-[var(--color-moncasa-border)] object-cover"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={uploadingEditImage || submitting}
                        onClick={() => setEditForm((current) => ({ ...current, image_url: '' }))}
                        className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-2 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] disabled:opacity-60"
                      >
                        Quitar imagen del producto
                      </button>
                      <button
                        type="button"
                        disabled={uploadingEditImage || submitting}
                        onClick={async () => {
                          const imageUrl = editForm.image_url;
                          if (!imageUrl) return;
                          setUploadingEditImage(true);
                          const removed = await removeImageFromStorage(imageUrl);
                          setEditForm((current) => ({ ...current, image_url: '' }));
                          setUploadingEditImage(false);
                          setEditUploadProgress(0);
                          setMessage(
                            removed
                              ? '✓ Imagen eliminada de Storage y del producto.'
                              : '✓ Imagen quitada del producto.',
                          );
                          clearMessage();
                        }}
                        className="rounded-lg bg-red-600/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-600/30 disabled:opacity-60"
                      >
                        Eliminar imagen en Storage
                      </button>
                    </div>
                  </div>
                ) : null}
                  </div>
                </details>

                <div className="sticky bottom-0 flex gap-2 border-t border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] pt-3">
                  <button
                    type="submit"
                    disabled={submitting || uploadingEditImage}
                    className="flex-1 rounded-lg bg-[#FE9A01] px-3 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95 disabled:opacity-60"
                  >
                    {submitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--color-moncasa-hover)]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL - TAB PRODUCTOS */}
        {activeTab === 'productos' && (
          <section className="grid gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            {/* FORMULARIO */}
            <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Agregar producto</p>
              <h1 className="mt-2 text-3xl font-black text-[var(--color-moncasa-text)]">Nuevo producto</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--color-moncasa-muted)]">
                Usa este formulario para cargar artículos al catálogo.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <details open className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4">
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#FE9A01]">
                    Datos básicos
                  </summary>
                  <div className="mt-3 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Categoría
                </label>
                <input
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Categoría *"
                  className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Nombre del producto
                </label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Nombre del producto *"
                  className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Descripción"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Precio unitario (L)
                </label>
                <input
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Precio (L) *"
                  className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                  </div>
                </details>
                <details className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4">
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#FE9A01]">
                    Inventario y visibilidad
                  </summary>
                  <div className="mt-3 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Inventario (unidades)
                </label>
                <input
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  placeholder="Stock (unidades) *"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Orden manual
                </label>
                <input
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                  placeholder="Orden manual (0 primero)"
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <p className="-mt-1 text-xs text-[var(--color-moncasa-muted)]">Menor número = más arriba en el catálogo.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-sm text-[var(--color-moncasa-text)]">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                    />
                    Producto activo (visible)
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-sm text-[var(--color-moncasa-text)]">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                    />
                    Producto destacado (primero)
                  </label>
                </div>
                  </div>
                </details>
                <details className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4">
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.25em] text-[#FE9A01]">
                    Imagen
                  </summary>
                  <div className="mt-3 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Imagen del producto
                </label>
                <input
                  value={form.image_url}
                  onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                  placeholder="URL de imagen"
                  className="w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <div className="rounded-2xl border border-dashed border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                    Subir imagen directa
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      void uploadProductImage(event, 'create');
                    }}
                    disabled={uploadingMainImage}
                    className="w-full text-xs text-[var(--color-moncasa-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[#FE9A01]/20 file:px-3 file:py-2 file:font-semibold file:text-[#FE9A01] hover:file:bg-[#FE9A01]/30"
                  />
                  <p className="mt-2 text-xs text-[var(--color-moncasa-muted)]">
                    {uploadingMainImage ? 'Subiendo imagen...' : 'PNG, JPG o WEBP (max 5MB).'}
                  </p>
                  {(uploadingMainImage || mainUploadProgress > 0) && (
                    <div className="mt-2">
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-moncasa-surface-soft)]">
                        <div
                          className="h-full rounded-full bg-[#FE9A01] transition-all duration-300"
                          style={{ width: `${mainUploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--color-moncasa-muted)]">{mainUploadProgress}%</p>
                    </div>
                  )}
                </div>

                {form.image_url ? (
                  <div className="space-y-2">
                    <Image
                      src={form.image_url}
                      alt="Vista previa"
                      width={800}
                      height={320}
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="h-40 w-full rounded-2xl border border-[var(--color-moncasa-border)] object-cover"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={uploadingMainImage || submitting}
                        onClick={() => setForm((current) => ({ ...current, image_url: '' }))}
                        className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-2 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] disabled:opacity-60"
                      >
                        Quitar imagen del formulario
                      </button>
                      <button
                        type="button"
                        disabled={uploadingMainImage || submitting}
                        onClick={async () => {
                          const imageUrl = form.image_url;
                          if (!imageUrl) return;
                          setUploadingMainImage(true);
                          const removed = await removeImageFromStorage(imageUrl);
                          setForm((current) => ({ ...current, image_url: '' }));
                          setUploadingMainImage(false);
                          setMainUploadProgress(0);
                          setMessage(
                            removed
                              ? '✓ Imagen eliminada de Storage y del formulario.'
                              : '✓ Imagen quitada del formulario.',
                          );
                          clearMessage();
                        }}
                        className="rounded-lg bg-red-600/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-600/30 disabled:opacity-60"
                      >
                        Eliminar imagen en Storage
                      </button>
                    </div>
                  </div>
                ) : null}
                  </div>
                </details>

                <button
                  type="submit"
                  disabled={submitting || uploadingMainImage}
                  className="w-full rounded-2xl bg-[#FE9A01] px-4 py-3 font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Guardando...' : 'Agregar producto'}
                </button>
              </form>

            </div>

            {/* CATÁLOGO */}
            <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Productos registrados</p>
                  <h2 className="mt-2 text-4xl font-black text-[var(--color-moncasa-text)]">Catálogo actual</h2>
                  <p className="mt-3 text-sm text-[var(--color-moncasa-muted)]">
                    <span className="font-bold text-[var(--color-moncasa-text)]">{filteredProducts.length} de {products.length}</span> producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-moncasa-muted-strong)] font-medium">
                    💡 Arrastra tarjetas para reordenar. Los destacados siempre van primero.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => void loadProducts()}
                    className="rounded-xl border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] hover:border-[var(--color-moncasa-text)]"
                  >
                    🔄 Recargar
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={products.length === 0}
                    className="rounded-xl border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] hover:border-[var(--color-moncasa-text)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    📥 CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOrder}
                    disabled={savingOrder || products.length === 0}
                    className="rounded-xl bg-[#FE9A01] px-4 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingOrder ? '⏳ Guardando...' : '💾 Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={submitting || products.length === 0}
                    className="rounded-xl bg-red-600/20 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-600/30 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    🗑️ Vaciar
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-4 hover:border-[#FE9A01]/30 transition">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-moncasa-muted)]">Total</p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">{dashboardStats.total}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-4 hover:border-green-400/30 transition">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-moncasa-muted)]">Activos</p>
                  <p className="mt-2 text-2xl font-black text-green-400">{dashboardStats.active}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-4 hover:border-red-400/30 transition">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-moncasa-muted)]">Inactivos</p>
                  <p className="mt-2 text-2xl font-black text-red-400">{dashboardStats.inactive}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-4 hover:border-[#FE9A01]/50 transition">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-moncasa-muted)]">Destacados</p>
                  <p className="mt-2 text-2xl font-black text-[#FE9A01]">{dashboardStats.featured}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-4 hover:border-red-400/30 transition">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-moncasa-muted)]">Sin inventario</p>
                  <p className="mt-2 text-2xl font-black text-red-400">{dashboardStats.outOfStock}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Filtro rápido
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm font-medium text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Solo activos</option>
                    <option value="inactive">Solo inactivos</option>
                    <option value="featured">Solo destacados</option>
                    <option value="out_of_stock">Sin inventario</option>
                  </select>
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                  Ordenar por
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as ProductSortMode)}
                    className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm font-medium text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                  >
                    <option value="manual">Manual (destacados + orden)</option>
                    <option value="name">Nombre A-Z</option>
                    <option value="price_desc">Precio mayor a menor</option>
                    <option value="price_asc">Precio menor a mayor</option>
                    <option value="stock_desc">Stock mayor a menor</option>
                    <option value="stock_asc">Stock menor a mayor</option>
                  </select>
                </label>
              </div>

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, categoría, precio o stock..."
                className="mt-4 w-full rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
              />

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <article
                      key={product.id}
                      draggable={canReorder}
                      onDragStart={() => handleDragStart(product.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(product.id)}
                      onDragEnd={() => setDraggingProductId(null)}
                      className="relative rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-6 transition hover:border-[#FE9A01]/50 hover:shadow-md"
                    >
                      <span className="absolute right-4 top-4 select-none text-xs font-semibold text-[var(--color-moncasa-muted)] bg-[var(--color-moncasa-page-bg)] px-2 py-1 rounded-lg">
                        {draggingProductId === product.id ? '✋ Moviendo...' : '☞ Arrastrar'}
                      </span>
                      <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#FE9A01]">{product.categoria || '—'}</p>
                      <h3 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)] line-clamp-2">{product.nombre || 'Sin nombre'}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-moncasa-muted)]">{product.descripcion || 'Sin descripción'}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          product.activo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {product.activo ? '✓ Activo' : '✕ Inactivo'}
                        </span>
                        {product.destacado ? (
                          <span className="rounded-full bg-[#FE9A01]/20 px-3 py-1 text-xs font-bold text-[#FE9A01]">
                            ⭐ Destacado
                          </span>
                        ) : null}
                        <span className="rounded-full border border-[var(--color-moncasa-border)] px-3 py-1 text-xs font-bold text-[var(--color-moncasa-muted)]">
                          #{product.orden}
                        </span>
                      </div>
                      {product.precio ? <p className="mt-4 text-lg font-bold text-[#FE9A01]">L {product.precio}</p> : null}
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          Number.parseInt(product.stock, 10) > 0
                            ? 'text-[var(--color-moncasa-muted)]'
                            : 'text-red-400 font-bold'
                        }`}
                      >
                        {Number.parseInt(product.stock, 10) > 0
                          ? `📦 Stock: ${product.stock}`
                          : '⚠️ Sin inventario'}
                      </p>

                      <div className="mt-5 flex flex-col gap-2 border-t border-[var(--color-moncasa-border)] pt-4">
                        {product.imagen_url ? (
                          <a
                            href={product.imagen_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#FE9A01] font-semibold underline hover:no-underline transition"
                          >
                            🖼️ Ver imagen
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--color-moncasa-muted-strong)] font-medium">📭 Sin imagen</span>
                        )}

                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleActive(product)}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              product.activo
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {product.activo ? '✓ Activo' : '◯ Inactivo'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleFeatured(product)}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              product.destacado
                                ? 'bg-[#FE9A01]/20 text-[#FE9A01] hover:bg-[#FE9A01]/30'
                                : 'border border-[var(--color-moncasa-border)] text-[var(--color-moncasa-muted)] hover:bg-[var(--color-moncasa-hover)]'
                            }`}
                          >
                            {product.destacado ? '⭐ Destacado' : '☆ Destacar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="rounded-xl bg-[#FE9A01] px-3 py-2 text-xs font-bold text-[#0A1116] transition hover:brightness-95"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="rounded-xl bg-red-600/20 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting === product.id ? '⏳ ...' : '🗑️ Eliminar'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="col-span-full rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-6 py-8 text-center">
                    <p className="text-[var(--color-moncasa-muted)]">
                      {products.length === 0 ? 'No hay productos aún.' : 'No se encontraron productos.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CONTENIDO PRINCIPAL - TAB MENSAJES */}
        {activeTab === 'mensajes' && (
          <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Mensajes de contacto</p>
              <h2 className="mt-2 text-4xl font-black text-[var(--color-moncasa-text)]">Bandeja de entrada</h2>
              <p className="mt-3 text-sm text-[var(--color-moncasa-muted)]">
                <span className="font-bold text-[var(--color-moncasa-text)]">{filteredMensajes.length}</span> de {mensajes.length} mensaj{mensajes.length !== 1 ? 'es' : 'e'}
              </p>
            </div>

            <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)] block mb-2">Buscar</label>
                <input
                  value={messageSearchTerm}
                  onChange={(event) => setMessageSearchTerm(event.target.value)}
                  placeholder="Nombre, email, asunto..."
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
              </div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">Desde
                <input
                  type="date"
                  value={messageDateFilter.from}
                  onChange={(event) => setMessageDateFilter((current) => ({ ...current, from: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">Hasta
                <input
                  type="date"
                  value={messageDateFilter.to}
                  onChange={(event) => setMessageDateFilter((current) => ({ ...current, to: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => void handleClearMessages()}
                  disabled={clearingMessages || mensajes.length === 0}
                  className="w-full rounded-xl bg-red-600/20 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-600/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearingMessages ? '⏳ Limpiando...' : '🗑️ Limpiar'}
                </button>
              </div>
            </div>

            {groupedMensajes.length > 0 ? (
              <div className="space-y-6">
                {groupedMensajes.map(([dateLabel, messagesByDate]) => (
                  <div key={dateLabel} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#FE9A01]">{dateLabel}</h3>
                      <span className="text-xs text-[var(--color-moncasa-muted)]">{messagesByDate.length} mensaje{messagesByDate.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid gap-4">
                      {messagesByDate.map((msg) => {
                        const fecha = new Date(msg.created_at).toLocaleDateString('es-HN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <article
                            key={msg.id}
                            className="group rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6 shadow-[0_8px_24px_var(--color-moncasa-shadow)] transition-all duration-200 hover:-translate-y-1 hover:border-[#FE9A01]/30 hover:shadow-[0_18px_42px_var(--color-moncasa-shadow)]"
                          >
                            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div>
                                <h3 className="text-lg font-bold text-[var(--color-moncasa-text)]">{msg.nombre}</h3>
                                <p className="text-xs text-[var(--color-moncasa-muted)]">{fecha}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {msg.asunto && (
                                  <span className="inline-flex rounded-full bg-[#FE9A01]/20 px-3 py-1 text-xs font-semibold text-[#FE9A01]">
                                    {msg.asunto}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteMessage(msg)}
                                  disabled={deletingMessageId === msg.id}
                                  className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {deletingMessageId === msg.id ? 'Borrando...' : 'Eliminar'}
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-semibold text-[var(--color-moncasa-muted)]">Email:</span>{' '}
                                  <a href={`mailto:${msg.email}`} className="text-[#FE9A01] hover:underline">
                                    {msg.email}
                                  </a>
                                </p>
                                {msg.telefono && (
                                  <p>
                                    <span className="font-semibold text-[var(--color-moncasa-muted)]">Teléfono:</span>{' '}
                                    <a href={`tel:${msg.telefono}`} className="text-[#FE9A01] hover:underline">
                                      {msg.telefono}
                                    </a>
                                  </p>
                                )}
                              </div>

                              <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                                  Mensaje
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[var(--color-moncasa-text)]">{msg.mensaje}</p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-6 py-12 text-center">
                <p className="text-lg text-[var(--color-moncasa-muted)]">No hay mensajes para este filtro.</p>
                <p className="mt-2 text-sm text-[var(--color-moncasa-muted-strong)]">
                  Los mensajes del formulario de contacto aparecerán aquí.
                </p>
              </div>
            )}
          </section>
        )}

        {/* CONTENIDO PRINCIPAL - TAB AUDITORIA */}
        {activeTab === 'auditoria' && (
          <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Auditoría</p>
                <h2 className="mt-2 text-3xl font-black text-[var(--color-moncasa-text)]">Historial de cambios</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void loadAuditLogs()}
                  className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-2 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]"
                >
                  Recargar
                </button>
                <button
                  type="button"
                  onClick={() => void handleClearAuditLogs()}
                  disabled={clearingAuditLogs || auditLogs.length === 0}
                  className="rounded-lg bg-red-600/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearingAuditLogs ? 'Limpiando...' : 'Limpiar auditoría'}
                </button>
              </div>
            </div>

            <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <input
                value={auditSearchTerm}
                onChange={(event) => setAuditSearchTerm(event.target.value)}
                placeholder="Buscar por acción, entidad, detalle o usuario"
                className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
              />
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                Desde
                <input
                  type="date"
                  value={auditDateFilter.from}
                  onChange={(event) => setAuditDateFilter((current) => ({ ...current, from: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                Hasta
                <input
                  type="date"
                  value={auditDateFilter.to}
                  onChange={(event) => setAuditDateFilter((current) => ({ ...current, to: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                />
              </label>
            </div>

            {groupedAuditLogs.length > 0 ? (
              <div className="space-y-6">
                {groupedAuditLogs.map(([dateLabel, logsByDate]) => (
                  <div key={dateLabel} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-[#FE9A01]">{dateLabel}</h3>
                      <span className="text-xs text-[var(--color-moncasa-muted)]">{logsByDate.length} evento{logsByDate.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-3">
                      {logsByDate.map((log) => {
                        const fecha = new Date(log.created_at).toLocaleString('es-HN');

                        return (
                          <article
                            key={log.id}
                            className="group rounded-[1.25rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 shadow-[0_8px_24px_var(--color-moncasa-shadow)] transition-all duration-200 hover:-translate-y-1 hover:border-[#FE9A01]/30 hover:shadow-[0_18px_42px_var(--color-moncasa-shadow)]"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#FE9A01]/20 px-2 py-1 text-[10px] font-bold text-[#FE9A01]">
                                  {log.accion}
                                </span>
                                <span className="rounded-full border border-[var(--color-moncasa-border)] px-2 py-1 text-[10px] font-bold text-[var(--color-moncasa-muted)]">
                                  {log.entidad}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--color-moncasa-muted)]">{fecha}</span>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteAuditLog(log)}
                                  disabled={deletingAuditId === log.id}
                                  className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {deletingAuditId === log.id ? 'Borrando...' : 'Eliminar'}
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                              <p className="text-sm leading-6 text-[var(--color-moncasa-text)]">{log.detalle}</p>
                              <p className="text-xs text-[var(--color-moncasa-muted)] lg:text-right">Usuario: {log.usuario_email}</p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-6 py-12 text-center">
                <p className="text-[var(--color-moncasa-muted)]">Sin registros de auditoría para este filtro.</p>
              </div>
            )}
          </section>
        )}

        {/* CONTENIDO PRINCIPAL - TAB CONFIGURACIÓN */}
        {activeTab === 'configuracion' && (
          <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Configuración</p>
              <h2 className="mt-2 text-3xl font-black text-[var(--color-moncasa-text)]">Gestiona tu sitio</h2>
              <p className="mt-2 max-w-2xl text-[var(--color-moncasa-muted)]">
                Edita títulos, descripciones, información de contacto y otros datos del sitio sin necesidad de código.
              </p>
            </div>
            <ConfigPanel currentUserEmail={currentUserEmail} />
          </section>
        )}

        {/* CONTENIDO PRINCIPAL - TAB SEGURIDAD */}
        {activeTab === 'seguridad' && (
          <section className="grid gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-2 lg:px-8">
            <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Roles</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">Gestión de admins</h2>
              <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">
                Define qué correos pueden administrar el panel y su nivel de acceso.
              </p>
              <p className="mt-2 text-xs text-[var(--color-moncasa-muted)]">
                Importante: asignar un rol no crea contraseña. Usa &quot;Enviar invitación&quot; para que el usuario reciba correo y defina su acceso.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Tu usuario</p>
                  <p className="mt-1 break-all text-sm font-semibold text-[var(--color-moncasa-text)]">
                    {currentUserEmail || 'Sin sesión'}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Tu rango</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-moncasa-text)]">{currentUserRoleLabel}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Estado</p>
                  <p className={`mt-1 text-sm font-semibold ${currentUserRoleRecord?.activo ? 'text-green-400' : 'text-red-400'}`}>
                    {currentUserAccessLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Total</p>
                  <p className="mt-1 text-xl font-black text-[var(--color-moncasa-text)]">{roleSummary.total}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Activos</p>
                  <p className="mt-1 text-xl font-black text-green-400">{roleSummary.active}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Inactivos</p>
                  <p className="mt-1 text-xl font-black text-red-400">{roleSummary.inactive}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3">
                  <p className="text-xs text-[var(--color-moncasa-muted)]">Owners</p>
                  <p className="mt-1 text-xl font-black text-[#FE9A01]">{roleSummary.owners}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3 text-xs text-[var(--color-moncasa-muted)]">
                {canManageRoles
                  ? 'Tienes permisos de propietario para cambiar o quitar accesos.'
                  : 'Tu cuenta puede ver la información, pero solo el propietario puede cambiar o quitar roles.'}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr_auto]">
                <input
                  value={newAdminEmail}
                  onChange={(event) => setNewAdminEmail(event.target.value)}
                  placeholder="correo@empresa.com"
                  className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <select
                  value={newAdminRole}
                  onChange={(event) => setNewAdminRole(normalizeAdminRole(event.target.value))}
                  className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                >
                  <option value="owner">owner</option>
                  <option value="admin">admin</option>
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                </select>
                <button
                  type="button"
                  onClick={() => void handleAddAdminRole()}
                  disabled={!canManageRoles}
                  className="rounded-xl bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Guardar
                </button>
              </div>
              <div className="mt-2 flex justify-stretch sm:justify-end">
                <button
                  type="button"
                  onClick={() => void handleInviteAccess(newAdminEmail)}
                  disabled={!canManageRoles || !newAdminEmail.trim() || invitingEmail === newAdminEmail.trim().toLowerCase()}
                  className="w-full rounded-xl border border-[var(--color-moncasa-border)] px-4 py-2 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {invitingEmail === newAdminEmail.trim().toLowerCase() ? 'Enviando...' : 'Enviar invitación al correo'}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={roleSearchTerm}
                  onChange={(event) => setRoleSearchTerm(event.target.value)}
                  placeholder="Buscar por correo o rango"
                  className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as AdminRoleFilter)}
                    className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                  >
                    <option value="all">Todos los rangos</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <select
                    value={roleStatusFilter}
                    onChange={(event) => setRoleStatusFilter(event.target.value as AdminRoleStatusFilter)}
                    className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {filteredAdminRoles.length > 0 ? (
                  filteredAdminRoles.map((roleItem) => (
                    (() => {
                      const isCurrentUserRoleItem =
                        roleItem.email.trim().toLowerCase() === normalizedCurrentUserEmail;
                      const canEditRoleItem = canManageRoles && !isCurrentUserRoleItem;

                      return (
                    <div
                      key={roleItem.id}
                      className="space-y-3 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="break-all text-sm font-semibold text-[var(--color-moncasa-text)]">{roleItem.email}</p>
                          <p className="text-xs text-[var(--color-moncasa-muted)]">
                            Rol actual: {ADMIN_ROLE_LABELS[normalizeAdminRole(roleItem.role)]}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${roleItem.activo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {roleItem.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="rounded-full bg-[#FE9A01]/20 px-2 py-1 text-[10px] font-bold text-[#FE9A01]">
                            {ADMIN_ROLE_LABELS[normalizeAdminRole(roleItem.role)]}
                          </span>
                        </div>
                      </div>
                      {canEditRoleItem ? (
                        <div className="grid gap-2 sm:grid-cols-[1.2fr_auto_auto]">
                          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-moncasa-muted)]">
                            Rango
                            <select
                              value={normalizeAdminRole(roleItem.role)}
                              onChange={(event) => void handleUpdateAdminRole(roleItem, normalizeAdminRole(event.target.value))}
                              disabled={!canManageRoles || roleActionId === roleItem.id}
                              className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => void handleToggleRoleActive(roleItem)}
                            disabled={!canManageRoles || roleActionId === roleItem.id}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              roleItem.activo
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {roleActionId === roleItem.id ? 'Guardando...' : roleItem.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRemoveAdminRole(roleItem)}
                            disabled={!canManageRoles || roleActionId === roleItem.id}
                            className="rounded-lg bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Quitar acceso
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleInviteAccess(roleItem.email)}
                            disabled={!canManageRoles || invitingEmail === roleItem.email.trim().toLowerCase()}
                            className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-1 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {invitingEmail === roleItem.email.trim().toLowerCase() ? 'Enviando...' : 'Enviar invitación'}
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-xs text-[var(--color-moncasa-muted)]">
                          {isCurrentUserRoleItem
                            ? 'Este es tu propio acceso. Las acciones sensibles se ocultan para evitar cambios accidentales.'
                            : 'Solo el propietario puede modificar este acceso.'}
                        </div>
                      )}
                    </div>
                      );
                    })()
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-moncasa-muted)]">
                    Sin coincidencias. Revisa el filtro o confirma que la tabla esté configurada.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Respaldos</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">Backup y restore</h2>
              <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">
                Crea snapshots del catálogo y restáuralos cuando necesites.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={backupName}
                  onChange={(event) => setBackupName(event.target.value)}
                  placeholder="Nombre del respaldo"
                  className="flex-1 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                />
                <button
                  type="button"
                  onClick={() => void handleCreateBackup()}
                  disabled={!canManageBackups}
                  className="w-full rounded-xl bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Crear
                </button>
              </div>

              <p className="mt-2 text-xs text-[var(--color-moncasa-muted)]">
                {canManageBackups
                  ? 'Puedes crear y restaurar respaldos con tu nivel actual.'
                  : 'Solo owner o admin pueden usar respaldos.'}
              </p>

              <div className="mt-5 space-y-2">
                {backups.length > 0 ? (
                  backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-moncasa-text)]">{backup.nombre}</p>
                        <p className="text-xs text-[var(--color-moncasa-muted)]">
                          {new Date(backup.created_at).toLocaleString('es-HN')} - {backup.productos.length} productos
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={restoringBackup || !canManageBackups}
                        onClick={() => void handleRestoreBackup(backup)}
                        className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-1 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] disabled:opacity-60"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-moncasa-muted)]">Sin respaldos o tabla no configurada.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {message ? (
          <div className="pointer-events-auto fixed bottom-6 right-6 z-[70] w-[min(92vw,28rem)] moncasa-toast-enter">
            <div
              className={`relative rounded-2xl border px-4 py-3 shadow-[0_20px_40px_var(--color-moncasa-shadow)] backdrop-blur-sm ${
                message.startsWith('✓')
                  ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                  : message.startsWith('⚠')
                    ? 'border-amber-400/50 bg-amber-500/15 text-amber-100'
                    : 'border-rose-400/50 bg-rose-500/15 text-rose-100'
              }`}
            >
              <button
                onClick={() => setMessage('')}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 transition opacity-70 hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <p className="text-sm font-semibold leading-6 pr-6">{message}</p>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
