export interface Cliente {
  id: string;
  nombre: string;
  placa: string;
  capacidadGalones: number;
  tipoCliente: 'corriente' | 'credito'; // Nuevo campo
  fechaRegistro: string;
  totalGalones?: number; // Calculado dinámicamente
}

export interface Venta {
  id: string;
  clienteId: string;
  trabajadorId: string;
  fecha: string; // ISO string
  galones: number;
  precioTotal: number;
  pagado: boolean;
  notas?: string;
}

export interface Trabajador {
  id: string;
  nombre: string;
  fechaRegistro: string;
}

export interface ResumenDia {
  totalVentas: number;
  totalGalones: number;
  totalIngresos: number;
  ventasPendientes: number;
  importePendiente: number;
}
