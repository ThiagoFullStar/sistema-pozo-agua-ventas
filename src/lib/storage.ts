import { Cliente, Venta, Trabajador } from './types';

const STORAGE_KEYS = {
  CLIENTES: 'pozo-agua-clientes',
  VENTAS: 'pozo-agua-ventas',
  TRABAJADORES: 'pozo-agua-trabajadores',
  TRABAJADOR_ACTUAL: 'pozo-agua-trabajador-actual'
};

// Verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

// Funciones para Clientes
export const loadClientes = (): Cliente[] => {
  if (!isClient) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    return [];
  }
};

export const saveCliente = (cliente: Cliente): boolean => {
  if (!isClient) return false;
  try {
    const clientes = loadClientes();
    const index = clientes.findIndex(c => c.id === cliente.id);
    
    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.push(cliente);
    }
    
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
    return true;
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    return false;
  }
};

export const deleteCliente = (clienteId: string): boolean => {
  if (!isClient) return false;
  try {
    const clientes = loadClientes();
    const filteredClientes = clientes.filter(c => c.id !== clienteId);
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(filteredClientes));
    return true;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return false;
  }
};

// Funciones para Ventas
export const loadVentas = (): Venta[] => {
  if (!isClient) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VENTAS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    return [];
  }
};

export const saveVenta = (venta: Venta): boolean => {
  if (!isClient) return false;
  try {
    const ventas = loadVentas();
    const index = ventas.findIndex(v => v.id === venta.id);
    
    if (index >= 0) {
      ventas[index] = venta;
    } else {
      ventas.push(venta);
    }
    
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
    return true;
  } catch (error) {
    console.error('Error al guardar venta:', error);
    return false;
  }
};

export const deleteVenta = (ventaId: string): boolean => {
  if (!isClient) return false;
  try {
    const ventas = loadVentas();
    const filteredVentas = ventas.filter(v => v.id !== ventaId);
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(filteredVentas));
    return true;
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    return false;
  }
};

// Funciones para Trabajadores
export const loadTrabajadores = (): Trabajador[] => {
  if (!isClient) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRABAJADORES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al cargar trabajadores:', error);
    return [];
  }
};

export const saveTrabajador = (trabajador: Trabajador): boolean => {
  if (!isClient) return false;
  try {
    const trabajadores = loadTrabajadores();
    const index = trabajadores.findIndex(t => t.id === trabajador.id);
    
    if (index >= 0) {
      trabajadores[index] = trabajador;
    } else {
      trabajadores.push(trabajador);
    }
    
    localStorage.setItem(STORAGE_KEYS.TRABAJADORES, JSON.stringify(trabajadores));
    return true;
  } catch (error) {
    console.error('Error al guardar trabajador:', error);
    return false;
  }
};

// Trabajador actual
export const getTrabajadorActual = (): string | null => {
  if (!isClient) return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.TRABAJADOR_ACTUAL);
  } catch (error) {
    console.error('Error al obtener trabajador actual:', error);
    return null;
  }
};

export const setTrabajadorActual = (trabajadorId: string): boolean => {
  if (!isClient) return false;
  try {
    localStorage.setItem(STORAGE_KEYS.TRABAJADOR_ACTUAL, trabajadorId);
    return true;
  } catch (error) {
    console.error('Error al establecer trabajador actual:', error);
    return false;
  }
};

// Utilidades
export const getVentasPorCliente = (clienteId: string): Venta[] => {
  const ventas = loadVentas();
  return ventas.filter(v => v.clienteId === clienteId);
};

export const getTotalGalonesPorCliente = (clienteId: string): number => {
  const ventas = getVentasPorCliente(clienteId);
  return ventas.reduce((total, venta) => total + venta.galones, 0);
};

export const getVentasDelDia = (fecha?: string): Venta[] => {
  const ventas = loadVentas();
  const fechaBuscar = fecha || new Date().toISOString().split('T')[0];
  
  return ventas.filter(venta => {
    const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
    return fechaVenta === fechaBuscar;
  });
};

export const clearAllData = (): boolean => {
  if (!isClient) return false;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    return false;
  }
};
