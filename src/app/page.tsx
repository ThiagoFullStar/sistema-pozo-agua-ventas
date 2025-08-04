"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
  const { 
    trabajadorActual, 
    getResumenDia, 
    getVentasDelDia, 
    clientes, 
    ventas 
  } = useApp();

  const resumen = getResumenDia();
  const ventasHoy = getVentasDelDia();
  const ventasRecientes = ventasHoy.slice(-5).reverse(); // Últimas 5 ventas

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nombre || 'Cliente no encontrado';
  };

  if (!trabajadorActual) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Bienvenido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <img 
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b49b23bb-eac5-4e76-a329-c46dc31a8a79.png" 
              alt="Imagen de bienvenida mostrando la interfaz para seleccionar trabajador"
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p className="text-gray-600">
              Por favor selecciona un trabajador en el menú lateral para comenzar a usar el sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {trabajadorActual.nombre}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Fecha actual</p>
          <p className="font-semibold">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Imagen de cabecera - Oculta en móvil */}
      <div className="relative hidden lg:block">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e0d7e729-76a2-43b5-98fd-63b8ed2ec6fd.png" 
          alt="Dashboard moderno para control de ventas de agua con interfaz limpia y profesional"
          className="w-full h-48 object-cover rounded-xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Sistema de Ventas</h2>
            <p className="text-lg">Pozo de Agua - Control Diario</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ventas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resumen.totalVentas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total de transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Galones Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resumen.totalGalones.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Galones distribuidos hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingresos del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(resumen.totalIngresos)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pagos recibidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {resumen.ventasPendientes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(resumen.importePendiente)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:block">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 lg:space-y-3">
            <Link href="/ventas">
              <Button className="w-full" size="sm">
                💰 Registrar Venta
              </Button>
            </Link>
            <Link href="/clientes">
              <Button variant="outline" className="w-full" size="sm">
                👥 Agregar Cliente
              </Button>
            </Link>
            <Link href="/reportes">
              <Button variant="secondary" className="w-full" size="sm">
                📊 Ver Reportes
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Ventas recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {ventasRecientes.length === 0 ? (
              <div className="text-center py-6 lg:py-8 text-gray-500">
                <p className="text-sm lg:text-base">No hay ventas registradas hoy</p>
                <Link href="/ventas">
                  <Button className="mt-3 lg:mt-4" size="sm">
                    Registrar Primera Venta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {ventasRecientes.map((venta) => (
                  <div
                    key={venta.id}
                    className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs lg:text-sm truncate">
                        {getClienteNombre(venta.clienteId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(venta.fecha)}
                      </p>
                    </div>
                    <div className="text-right mx-2">
                      <p className="font-semibold text-xs lg:text-sm">
                        {venta.galones} gal
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(venta.precioTotal)}
                      </p>
                    </div>
                    <div>
                      <Badge 
                        variant={venta.pagado ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {venta.pagado ? "✓" : "⏳"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Clientes:</span>
              <span className="font-semibold">{clientes.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Ventas Registradas:</span>
              <span className="font-semibold">{ventas.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Promedio Galones/Venta:</span>
              <span className="font-semibold">
                {ventas.length > 0 
                  ? Math.round(ventas.reduce((sum, v) => sum + v.galones, 0) / ventas.length)
                  : 0
                } gal
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sistema funcionando correctamente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Datos guardados localmente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Trabajador: {trabajadorActual.nombre}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
