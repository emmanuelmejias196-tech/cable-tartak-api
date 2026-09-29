import { Cliente, Falla, Pago, ServerMetricas, ApiLog, AlertaMasivaZona, Factura, InventarioAlmacen, PlanDisponible, SolicitudCambioPlan, EstadoDeuda } from '../types';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.error || data?.mensaje || response.statusText || 'Error en la petición';
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}

export const api = {
  // 💼 Admin Endpoints
  preCargarCliente: (cedula: string, nombre: string, plan: string) =>
    request<{ mensaje: string; total: number; cliente: Cliente }>('/api/admin/pre-cargar-cliente', {
      method: 'POST',
      body: JSON.stringify({ cedula, nombre, plan }),
    }),

  getClientes: () => request<Cliente[]>('/api/admin/clientes'),

  getFallas: () => request<Falla[]>('/api/admin/fallas'),

  getPagos: () => request<Pago[]>('/api/admin/pagos'),

  actualizarFalla: (id: string, estado: 'Pendiente' | 'En Revisión' | 'Resuelto', notaTecnica?: string) =>
    request<{ mensaje: string; falla: Falla }>(`/api/admin/fallas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, notaTecnica }),
    }),

  reiniciarDatos: () =>
    request<{ mensaje: string; totalClientes: number }>('/api/admin/reiniciar-datos', {
      method: 'POST',
    }),

  getAlertaMasiva: () => request<AlertaMasivaZona>('/api/admin/alerta-masiva'),

  actualizarAlertaMasiva: (zona: string, motivo: string, activo: boolean) =>
    request<{ mensaje: string; alerta?: AlertaMasivaZona }>('/api/admin/alerta-masiva', {
      method: 'POST',
      body: JSON.stringify({ zona, motivo, activo }),
    }),

  getInventario: () => request<InventarioAlmacen>('/api/admin/inventario'),

  despacharMateriales: (cableGastado: number, conectoresGastados: number) =>
    request<{ mensaje: string; inventarioActual: InventarioAlmacen }>('/api/admin/despachar-materiales', {
      method: 'POST',
      body: JSON.stringify({ cableGastado, conectoresGastados }),
    }),

  getSolicitudesPlanes: () => request<SolicitudCambioPlan[]>('/api/admin/solicitudes-planes'),

  procesarSolicitudPlan: (id: string, estado: 'Aprobado' | 'Rechazado') =>
    request<{ mensaje: string; solicitud: SolicitudCambioPlan }>(`/api/admin/solicitudes-planes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  getDeudaCliente: (cedula: string) =>
    request<EstadoDeuda>(`/api/admin/deuda/${cedula}`),

  // 📱 Mobile App Endpoints
  getEstadoRed: () => request<AlertaMasivaZona>('/api/app/estado-red'),

  getPlanes: () => request<PlanDisponible[]>('/api/app/planes'),

  solicitarCambioPlan: (cedula: string, nuevoPlanId: string) =>
    request<{ mensaje: string; solicitud?: SolicitudCambioPlan }>('/api/app/solicitar-cambio', {
      method: 'POST',
      body: JSON.stringify({ cedula, nuevoPlanId }),
    }),

  getFacturasCliente: (cedula: string) =>
    request<{ cedula: string; historial: Factura[] }>(`/api/app/facturas/${cedula}`),

  verificarCedula: (cedula: string) =>
    request<{ nombre: string; plan: string; alertaRed?: AlertaMasivaZona | null }>('/api/app/verificar-cedula', {
      method: 'POST',
      body: JSON.stringify({ cedula }),
    }),

  activarUsuario: (cedula: string, clave: string) =>
    request<{ mensaje: string; cliente: Cliente }>('/api/app/activar-usuario', {
      method: 'POST',
      body: JSON.stringify({ cedula, clave }),
    }),

  loginCliente: (cedula: string, clave: string) =>
    request<{ mensaje: string; cliente: Cliente; pagos: Pago[]; fallas: Falla[] }>('/api/app/login', {
      method: 'POST',
      body: JSON.stringify({ cedula, clave }),
    }),

  crearReporte: (params: { cedula: string; tipo: 'pago' | 'falla'; detalle: string; monto?: string; referencia?: string }) =>
    request<{ mensaje: string; tipo: string; registro: any }>('/api/app/crear-reporte', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // 📊 Server Endpoints
  getMetricas: () => request<ServerMetricas>('/api/server/metricas'),

  getLogs: () => request<ApiLog[]>('/api/server/logs'),
};