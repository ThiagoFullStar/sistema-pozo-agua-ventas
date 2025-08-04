"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function ReportesPage() {
  const { 
    clientes, 
    ventas, 
    trabajadores,
    getVentasDelDia
  } = useApp();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [trabajadorFiltro, setTrabajadorFiltro] = useState('todos');

  // Calcular estadísticas generales
  const estadisticasGenerales = useMemo(() => {
    const totalVentas = ventas.length;
    const totalGalones = ventas.reduce((sum, v) => sum + v.galones, 0);
    const totalIngresos = ventas.filter(v => v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
    const totalPendiente = ventas.filter(v => !v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
    const promedioGalonesPorVenta = totalVentas > 0 ? totalGalones / totalVentas : 0;
    const promedioPrecioPorGalon = totalGalones > 0 ? (totalIngresos + totalPendiente) / totalGalones : 0;

    return {
      totalVentas,
      totalGalones,
      totalIngresos,
      totalPendiente,
      promedioGalonesPorVenta,
      promedioPrecioPorGalon
    };
  }, [ventas]);

  // Filtrar ventas por fecha y trabajador
  const ventasFiltradas = useMemo(() => {
    let ventasFiltered = [...ventas];

    // Filtrar por fechas
    if (fechaInicio) {
      ventasFiltered = ventasFiltered.filter(v => 
        new Date(v.fecha) >= new Date(fechaInicio)
      );
    }
    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin);
      fechaFinDate.setHours(23, 59, 59, 999); // Incluir todo el día
      ventasFiltered = ventasFiltered.filter(v => 
        new Date(v.fecha) <= fechaFinDate
      );
    }

    // Filtrar por trabajador
    if (trabajadorFiltro !== 'todos') {
      ventasFiltered = ventasFiltered.filter(v => v.trabajadorId === trabajadorFiltro);
    }

    return ventasFiltered;
  }, [ventas, fechaInicio, fechaFin, trabajadorFiltro]);

  // Estadísticas por cliente
  const estadisticasPorCliente = useMemo(() => {
    const clienteStats = clientes.map(cliente => {
      const ventasCliente = ventasFiltradas.filter(v => v.clienteId === cliente.id);
      const totalGalones = ventasCliente.reduce((sum, v) => sum + v.galones, 0);
      const totalGastado = ventasCliente.reduce((sum, v) => sum + v.precioTotal, 0);
      const totalPagado = ventasCliente.filter(v => v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
      const totalDeuda = ventasCliente.filter(v => !v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
      const numeroVisitas = ventasCliente.length;
      const ultimaVisita = ventasCliente.length > 0 
        ? Math.max(...ventasCliente.map(v => new Date(v.fecha).getTime()))
        : null;

      return {
        cliente,
        totalGalones,
        totalGastado,
        totalPagado,
        totalDeuda,
        numeroVisitas,
        ultimaVisita: ultimaVisita ? new Date(ultimaVisita) : null,
        promedioGalonesPorVisita: numeroVisitas > 0 ? totalGalones / numeroVisitas : 0
      };
    }).filter(stat => stat.numeroVisitas > 0); // Solo clientes con ventas

    return clienteStats.sort((a, b) => b.totalGalones - a.totalGalones);
  }, [clientes, ventasFiltradas]);

  // Estadísticas por trabajador
  const estadisticasPorTrabajador = useMemo(() => {
    const trabajadorStats = trabajadores.map(trabajador => {
      const ventasTrabajador = ventasFiltradas.filter(v => v.trabajadorId === trabajador.id);
      const totalVentas = ventasTrabajador.length;
      const totalGalones = ventasTrabajador.reduce((sum, v) => sum + v.galones, 0);
      const totalIngresos = ventasTrabajador.filter(v => v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);

      return {
        trabajador,
        totalVentas,
        totalGalones,
        totalIngresos,
        promedioGalonesPorVenta: totalVentas > 0 ? totalGalones / totalVentas : 0
      };
    }).filter(stat => stat.totalVentas > 0);

    return trabajadorStats.sort((a, b) => b.totalVentas - a.totalVentas);
  }, [trabajadores, ventasFiltradas]);

  // Ventas por día (últimos 7 días)
  const ventasPorDia = useMemo(() => {
    const dias = [];
    const hoy = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const ventasDelDia = getVentasDelDia(fechaStr);
      const totalGalones = ventasDelDia.reduce((sum, v) => sum + v.galones, 0);
      const totalIngresos = ventasDelDia.filter(v => v.pagado).reduce((sum, v) => sum + v.precioTotal, 0);
      
      dias.push({
        fecha: fechaStr,
        fechaFormateada: fecha.toLocaleDateString('es-CO', { 
          weekday: 'short', 
          day: '2-digit', 
          month: '2-digit' 
        }),
        totalVentas: ventasDelDia.length,
        totalGalones,
        totalIngresos
      });
    }
    
    return dias;
  }, [getVentasDelDia]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO');
  };

  const exportarDatos = () => {
    const datos = ventasFiltradas.map(venta => {
      const cliente = clientes.find(c => c.id === venta.clienteId);
      const trabajador = trabajadores.find(t => t.id === venta.trabajadorId);
      
      return {
        Fecha: new Date(venta.fecha).toLocaleString('es-CO'),
        Cliente: cliente?.nombre || 'N/A',
        Placa: cliente?.placa || 'N/A',
        Galones: venta.galones,
        Precio: venta.precioTotal,
        Pagado: venta.pagado ? 'Sí' : 'No',
        Trabajador: trabajador?.nombre || 'N/A',
        Notas: venta.notas || ''
      };
    });

    const csv = [
      Object.keys(datos[0] || {}).join(','),
      ...datos.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado de ventas y clientes
          </p>
        </div>
        <Button onClick={exportarDatos} disabled={ventasFiltradas.length === 0}>
          Exportar Datos
        </Button>
      </div>

      {/* Imagen de cabecera */}
      <div className="relative">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/62be74d5-d72f-4e03-b3cc-fc39075c7a7a.png" 
          alt="Dashboard de reportes y estadísticas con gráficos modernos y análisis detallado"
          className="w-full h-32 object-cover rounded-xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xl font-bold">Análisis de Datos</h2>
            <p className="text-sm mt-1">Información detallada para tomar decisiones</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div>
              <Label>Trabajador</Label>
              <Select value={trabajadorFiltro} onValueChange={setTrabajadorFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar trabajador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los trabajadores</SelectItem>
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(fechaInicio || fechaFin || trabajadorFiltro !== 'todos') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Mostrando {ventasFiltradas.length} ventas con los filtros aplicados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estadisticasGenerales.totalVentas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Transacciones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Galones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticasGenerales.totalGalones.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Promedio: {Math.round(estadisticasGenerales.promedioGalonesPorVenta)} por venta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(estadisticasGenerales.totalIngresos)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(estadisticasGenerales.promedioPrecioPorGalon)} por galón
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendiente de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(estadisticasGenerales.totalPendiente)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por cobrar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes reportes */}
      <Tabs defaultValue="clientes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clientes">Por Cliente</TabsTrigger>
          <TabsTrigger value="trabajadores">Por Trabajador</TabsTrigger>
          <TabsTrigger value="tiempo">Por Tiempo</TabsTrigger>
        </TabsList>

        {/* Reporte por clientes */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {estadisticasPorCliente.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay datos de clientes para mostrar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {estadisticasPorCliente.map((stat) => (
                    <div
                      key={stat.cliente.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {stat.cliente.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{stat.cliente.nombre}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500">{stat.cliente.placa}</p>
                              <Badge variant={stat.cliente.tipoCliente === 'credito' ? 'destructive' : 'default'} className="text-xs">
                                {stat.cliente.tipoCliente === 'credito' ? 'Crédito' : 'Corriente'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Visitas</p>
                          <p className="font-semibold">{stat.numeroVisitas}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Galones</p>
                          <p className="font-semibold text-green-600">
                            {stat.totalGalones.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Gastado</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(stat.totalGastado)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Deuda</p>
                          <p className={`font-semibold ${stat.totalDeuda > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {formatCurrency(stat.totalDeuda)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        {stat.totalDeuda > 0 && (
                          <Badge variant="destructive">
                            Debe
                          </Badge>
                        )}
                        <Link href={`/reportes/${stat.cliente.id}`}>
                          <Button size="sm" variant="outline">
                            Ver Detalle
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte por trabajadores */}
        <TabsContent value="trabajadores">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Trabajador</CardTitle>
            </CardHeader>
            <CardContent>
              {estadisticasPorTrabajador.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay datos de trabajadores para mostrar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {estadisticasPorTrabajador.map((stat) => (
                    <div
                      key={stat.trabajador.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            {stat.trabajador.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{stat.trabajador.nombre}</h4>
                          <p className="text-sm text-gray-500">
                            Registrado: {formatDate(new Date(stat.trabajador.fechaRegistro))}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Ventas</p>
                          <p className="font-semibold text-blue-600">{stat.totalVentas}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Galones</p>
                          <p className="font-semibold text-green-600">
                            {stat.totalGalones.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ingresos</p>
                          <p className="font-semibold text-emerald-600">
                            {formatCurrency(stat.totalIngresos)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte por tiempo */}
        <TabsContent value="tiempo">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Día (Últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ventasPorDia.map((dia) => (
                  <div
                    key={dia.fecha}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{dia.fechaFormateada}</h4>
                      <p className="text-sm text-gray-500">{dia.fecha}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Ventas</p>
                        <p className="font-semibold text-blue-600">{dia.totalVentas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Galones</p>
                        <p className="font-semibold text-green-600">
                          {dia.totalGalones.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ingresos</p>
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(dia.totalIngresos)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
