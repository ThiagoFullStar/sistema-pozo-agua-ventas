"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReporteClientePage() {
  const params = useParams();
  const router = useRouter();
  const clienteId = params.clienteId as string;
  
  const { 
    clientes, 
    ventas, 
    trabajadores,
    getClienteConGalones
  } = useApp();

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'dia' | 'semana' | 'mes'>('dia');

  const cliente = clientes.find(c => c.id === clienteId);
  const clienteConGalones = getClienteConGalones(clienteId);

  // Filtrar ventas del cliente por período
  const ventasCliente = useMemo(() => {
    const todasLasVentas = ventas.filter(v => v.clienteId === clienteId);
    const ahora = new Date();
    
    return todasLasVentas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      
      switch (periodoSeleccionado) {
        case 'dia':
          return fechaVenta.toDateString() === ahora.toDateString();
        case 'semana':
          const inicioSemana = new Date(ahora);
          inicioSemana.setDate(ahora.getDate() - 7);
          return fechaVenta >= inicioSemana;
        case 'mes':
          const inicioMes = new Date(ahora);
          inicioMes.setDate(ahora.getDate() - 30);
          return fechaVenta >= inicioMes;
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [ventas, clienteId, periodoSeleccionado]);

  // Estadísticas del período
  const estadisticas = useMemo(() => {
    const totalVentas = ventasCliente.length;
    const totalGalones = ventasCliente.reduce((sum, v) => sum + v.galones, 0);
    const totalFacturado = ventasCliente.reduce((sum, v) => sum + v.precioTotal, 0);
    const totalPagado = ventasCliente.filter(v => v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
    const totalPendiente = ventasCliente.filter(v => !v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
    const ventasPendientes = ventasCliente.filter(v => !v.pagado).length;

    return {
      totalVentas,
      totalGalones,
      totalFacturado,
      totalPagado,
      totalPendiente,
      ventasPendientes
    };
  }, [ventasCliente]);

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

  const getTrabajadorNombre = (trabajadorId: string) => {
    const trabajador = trabajadores.find(t => t.id === trabajadorId);
    return trabajador?.nombre || 'N/A';
  };

  const exportarReporte = () => {
    if (!cliente) return;

    const datos = ventasCliente.map(venta => ({
      Fecha: formatDate(venta.fecha),
      Galones: venta.galones,
      Precio: venta.precioTotal,
      Estado: venta.pagado ? 'Pagado' : 'Pendiente',
      Trabajador: getTrabajadorNombre(venta.trabajadorId),
      Notas: venta.notas || ''
    }));

    const resumen = [
      ['REPORTE DE CLIENTE'],
      ['Cliente:', cliente.nombre],
      ['Placa:', cliente.placa],
      ['Período:', periodoSeleccionado],
      ['Fecha del reporte:', new Date().toLocaleString('es-CO')],
      [''],
      ['RESUMEN'],
      ['Total ventas:', estadisticas.totalVentas],
      ['Total galones:', estadisticas.totalGalones],
      ['Total facturado:', formatCurrency(estadisticas.totalFacturado)],
      ['Total pagado:', formatCurrency(estadisticas.totalPagado)],
      ['Total pendiente:', formatCurrency(estadisticas.totalPendiente)],
      [''],
      ['DETALLE DE VENTAS']
    ];

    const csv = [
      ...resumen.map(row => row.join(',')),
      Object.keys(datos[0] || {}).join(','),
      ...datos.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${cliente.nombre.replace(/\s+/g, '-')}-${periodoSeleccionado}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Cliente no encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.back()}>
              Volver
            </Button>
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
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            ← Volver a Reportes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Reporte de {cliente.nombre}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">{cliente.placa}</Badge>
            <Badge variant={cliente.tipoCliente === 'credito' ? 'destructive' : 'default'}>
              {cliente.tipoCliente === 'credito' ? 'Crédito' : 'Corriente'}
            </Badge>
            <span className="text-gray-600">
              Capacidad: {cliente.capacidadGalones} gal
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={periodoSeleccionado} onValueChange={(value: 'dia' | 'semana' | 'mes') => setPeriodoSeleccionado(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoy</SelectItem>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mes</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportarReporte} disabled={ventasCliente.length === 0}>
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Estadísticas del período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ventas en el Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.totalVentas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Galones Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.totalGalones.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total histórico: {clienteConGalones?.totalGalones?.toLocaleString() || 0} gal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Facturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(estadisticas.totalFacturado)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pagado: {formatCurrency(estadisticas.totalPagado)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estadisticas.totalPendiente > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {formatCurrency(estadisticas.totalPendiente)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {estadisticas.ventasPendientes} ventas pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Detalle de Ventas - {periodoSeleccionado === 'dia' ? 'Hoy' : 
                                 periodoSeleccionado === 'semana' ? 'Última Semana' : 'Último Mes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ventasCliente.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay ventas en el período seleccionado</p>
              <p className="text-sm mt-1">Cambia el período o verifica las fechas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ventasCliente.map((venta) => (
                <div
                  key={venta.id}
                  className={`p-4 rounded-lg border ${
                    venta.pagado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          {venta.galones} galones
                        </span>
                        <Badge variant={venta.pagado ? "default" : "destructive"}>
                          {venta.pagado ? "Pagado" : "Pendiente"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Fecha: {formatDate(venta.fecha)}</span>
                        <span>Trabajador: {getTrabajadorNombre(venta.trabajadorId)}</span>
                        <span>Precio/gal: {formatCurrency(venta.precioTotal / venta.galones)}</span>
                      </div>
                      {venta.notas && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          Notas: {venta.notas}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {formatCurrency(venta.precioTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen para envío */}
      {cliente.tipoCliente === 'credito' && estadisticas.totalPendiente > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Resumen para Envío al Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Cliente:</strong> {cliente.nombre}</p>
              <p><strong>Placa:</strong> {cliente.placa}</p>
              <p><strong>Período:</strong> {periodoSeleccionado === 'dia' ? 'Hoy' : 
                                           periodoSeleccionado === 'semana' ? 'Última Semana' : 'Último Mes'}</p>
              <p><strong>Total de galones:</strong> {estadisticas.totalGalones} galones</p>
              <p><strong>Total a pagar:</strong> {formatCurrency(estadisticas.totalPendiente)}</p>
              <p><strong>Ventas pendientes:</strong> {estadisticas.ventasPendientes}</p>
            </div>
            <div className="mt-4">
              <Button onClick={exportarReporte} className="w-full">
                Generar Reporte para Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
