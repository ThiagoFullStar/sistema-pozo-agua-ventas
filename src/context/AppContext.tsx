"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Cliente, Venta, Trabajador, ResumenDia } from '@/lib/types';
import {
  loadClientes,
  saveCliente,
  deleteCliente,
  loadVentas,
  saveVenta,
  deleteVenta,
  loadTrabajadores,
  saveTrabajador,
  getTrabajadorActual,
  setTrabajadorActual,
  getTotalGalonesPorCliente,
  getVentasDelDia
} from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';

interface AppContextType {
  // Estados
  clientes: Cliente[];
  ventas: Venta[];
  trabajadores: Trabajador[];
  trabajadorActual: Trabajador | null;
  loading: boolean;

  // Funciones para Clientes
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'fechaRegistro'>) => Promise<boolean>;
  actualizarCliente: (cliente: Cliente) => Promise<boolean>;
  eliminarCliente: (clienteId: string) => Promise<boolean>;
  buscarClientes: (termino: string) => Cliente[];

  // Funciones para Ventas
  agregarVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'trabajadorId'>) => Promise<boolean>;
  actualizarVenta: (venta: Venta) => Promise<boolean>;
  eliminarVenta: (ventaId: string) => Promise<boolean>;
  getVentasDelDia: (fecha?: string) => Venta[];

  // Funciones para Trabajadores
  agregarTrabajador: (trabajador: Omit<Trabajador, 'id' | 'fechaRegistro'>) => Promise<boolean>;
  seleccionarTrabajador: (trabajadorId: string) => Promise<boolean>;

  // Utilidades
  getResumenDia: (fecha?: string) => ResumenDia;
  getClienteConGalones: (clienteId: string) => Cliente | null;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorActual, setTrabajadorActualState] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales y suscribirse a cambios en Supabase
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Solo cargar datos si estamos en el cliente
        if (typeof window !== 'undefined') {
          const clientesData = loadClientes();
          const ventasData = loadVentas();
          const trabajadoresData = loadTrabajadores();
          const trabajadorActualId = getTrabajadorActual();

          setClientes(clientesData);
          setVentas(ventasData);
          setTrabajadores(trabajadoresData);

          if (trabajadorActualId) {
            const trabajador = trabajadoresData.find(t => t.id === trabajadorActualId);
            setTrabajadorActualState(trabajador || null);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();

    // Suscripción a cambios en la tabla ventas
    const subscription = supabase
      .channel('public:ventas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, (payload) => {
        // Refrescar datos cuando hay cambios
        const refreshData = () => {
          setClientes(loadClientes());
          setVentas(loadVentas());
          setTrabajadores(loadTrabajadores());
        };
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Funciones para Clientes
  const agregarCliente = async (clienteData: Omit<Cliente, 'id' | 'fechaRegistro'>): Promise<boolean> => {
    try {
      const nuevoCliente: Cliente = {
        ...clienteData,
        id: Date.now().toString(),
        fechaRegistro: new Date().toISOString()
      };

      const success = saveCliente(nuevoCliente);
      if (success) {
        setClientes(prev => [...prev, nuevoCliente]);
      }
      return success;
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      return false;
    }
  };

  const actualizarCliente = async (cliente: Cliente): Promise<boolean> => {
    try {
      const success = saveCliente(cliente);
      if (success) {
        setClientes(prev => prev.map(c => c.id === cliente.id ? cliente : c));
      }
      return success;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      return false;
    }
  };

  const eliminarCliente = async (clienteId: string): Promise<boolean> => {
    try {
      const success = deleteCliente(clienteId);
      if (success) {
        setClientes(prev => prev.filter(c => c.id !== clienteId));
      }
      return success;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      return false;
    }
  };

  const buscarClientes = (termino: string): Cliente[] => {
    if (!termino.trim()) return clientes;
    
    const terminoLower = termino.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(terminoLower) ||
      cliente.placa.toLowerCase().includes(terminoLower)
    );
  };

  // Funciones para Ventas
  const agregarVenta = async (ventaData: Omit<Venta, 'id' | 'fecha' | 'trabajadorId'>): Promise<boolean> => {
    try {
      if (!trabajadorActual) {
        console.error('No hay trabajador seleccionado');
        return false;
      }

      const nuevaVenta: Venta = {
        ...ventaData,
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        trabajadorId: trabajadorActual.id
      };

      const success = saveVenta(nuevaVenta);
      if (success) {
        setVentas(prev => [...prev, nuevaVenta]);
      }
      return success;
    } catch (error) {
      console.error('Error al agregar venta:', error);
      return false;
    }
  };

  const actualizarVenta = async (venta: Venta): Promise<boolean> => {
    try {
      const success = saveVenta(venta);
      if (success) {
        setVentas(prev => prev.map(v => v.id === venta.id ? venta : v));
      }
      return success;
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      return false;
    }
  };

  const eliminarVenta = async (ventaId: string): Promise<boolean> => {
    try {
      const success = deleteVenta(ventaId);
      if (success) {
        setVentas(prev => prev.filter(v => v.id !== ventaId));
      }
      return success;
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      return false;
    }
  };

  const getVentasDelDiaContext = (fecha?: string): Venta[] => {
    return getVentasDelDia(fecha);
  };

  // Funciones para Trabajadores
  const agregarTrabajador = async (trabajadorData: Omit<Trabajador, 'id' | 'fechaRegistro'>): Promise<boolean> => {
    try {
      const nuevoTrabajador: Trabajador = {
        ...trabajadorData,
        id: Date.now().toString(),
        fechaRegistro: new Date().toISOString()
      };

      const success = saveTrabajador(nuevoTrabajador);
      if (success) {
        setTrabajadores(prev => [...prev, nuevoTrabajador]);
      }
      return success;
    } catch (error) {
      console.error('Error al agregar trabajador:', error);
      return false;
    }
  };

  const seleccionarTrabajador = async (trabajadorId: string): Promise<boolean> => {
    try {
      const trabajador = trabajadores.find(t => t.id === trabajadorId);
      if (!trabajador) return false;

      const success = setTrabajadorActual(trabajadorId);
      if (success) {
        setTrabajadorActualState(trabajador);
      }
      return success;
    } catch (error) {
      console.error('Error al seleccionar trabajador:', error);
      return false;
    }
  };

  // Utilidades
  const getResumenDia = (fecha?: string): ResumenDia => {
    const ventasDelDia = getVentasDelDiaContext(fecha);
    
    const totalVentas = ventasDelDia.length;
    const totalGalones = ventasDelDia.reduce((sum, venta) => sum + venta.galones, 0);
    const totalIngresos = ventasDelDia.filter(v => v.pagado).reduce((sum, venta) => sum + venta.precioTotal, 0);
    const ventasPendientes = ventasDelDia.filter(v => !v.pagado).length;
    const importePendiente = ventasDelDia.filter(v => !v.pagado).reduce((sum, venta) => sum + venta.precioTotal, 0);

    return {
      totalVentas,
      totalGalones,
      totalIngresos,
      ventasPendientes,
      importePendiente
    };
  };

  const getClienteConGalones = (clienteId: string): Cliente | null => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return null;

    const totalGalones = getTotalGalonesPorCliente(clienteId);
    return {
      ...cliente,
      totalGalones
    };
  };

  const refreshData = () => {
    setClientes(loadClientes());
    setVentas(loadVentas());
    setTrabajadores(loadTrabajadores());
  };

  const value: AppContextType = {
    // Estados
    clientes,
    ventas,
    trabajadores,
    trabajadorActual,
    loading,

    // Funciones para Clientes
    agregarCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,

    // Funciones para Ventas
    agregarVenta,
    actualizarVenta,
    eliminarVenta,
    getVentasDelDia: getVentasDelDiaContext,

    // Funciones para Trabajadores
    agregarTrabajador,
    seleccionarTrabajador,

    // Utilidades
    getResumenDia,
    getClienteConGalones,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
