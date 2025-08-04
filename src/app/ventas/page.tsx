"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Cliente, Venta } from '@/lib/types';
import { ClienteSearcher } from '@/components/ClienteSearcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

export default function VentasPage() {
  const { 
    trabajadorActual, 
    agregarVenta, 
    getVentasDelDia, 
    clientes,
    actualizarVenta,
    eliminarVenta
  } = useApp();

  // Estados del formulario
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [galones, setGalones] = useState<string>('');
  const [precioTotal, setPrecioTotal] = useState<string>('');
  const [pagado, setPagado] = useState<boolean>(true);
  const [notas, setNotas] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Estados para edición
  const [ventaEditando, setVentaEditando] = useState<Venta | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const ventasHoy = getVentasDelDia();

  const resetForm = () => {
    setClienteSeleccionado(null);
    setGalones('');
    setPrecioTotal('');
    setPagado(true);
    setNotas('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trabajadorActual) {
      toast.error('No hay trabajador seleccionado');
      return;
    }

    if (!clienteSeleccionado) {
      toast.error('Por favor selecciona un cliente');
      return;
    }

    if (!galones || parseFloat(galones) <= 0) {
      toast.error('Por favor ingresa una cantidad válida de galones');
      return;
    }

    if (!precioTotal || parseFloat(precioTotal) <= 0) {
      toast.error('Por favor ingresa un precio válido');
      return;
    }

    // Validar que no exceda la capacidad del vehículo
    if (parseFloat(galones) > clienteSeleccionado.capacidadGalones) {
      toast.error(`La cantidad no puede exceder la capacidad del vehículo (${clienteSeleccionado.capacidadGalones} gal)`);
      return;
    }

    setLoading(true);

    try {
      const ventaData = {
        clienteId: clienteSeleccionado.id,
        galones: parseFloat(galones),
        precioTotal: parseFloat(precioTotal),
        pagado: clienteSeleccionado.tipoCliente === 'corriente' ? pagado : false, // Clientes a crédito siempre quedan debiendo inicialmente
        notas: notas.trim() || undefined
      };

      const success = await agregarVenta(ventaData);
      
      if (success) {
        toast.success('Venta registrada correctamente');
        resetForm();
      } else {
        toast.error('Error al registrar la venta');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVenta = (venta: Venta) => {
    setVentaEditando(venta);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVenta = async (ventaActualizada: Venta) => {
    const success = await actualizarVenta(ventaActualizada);
    if (success) {
      toast.success('Venta actualizada correctamente');
      setIsEditDialogOpen(false);
      setVentaEditando(null);
    } else {
      toast.error('Error al actualizar la venta');
    }
  };

  const handleDeleteVenta = async (ventaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      const success = await eliminarVenta(ventaId);
      if (success) {
        toast.success('Venta eliminada correctamente');
      } else {
        toast.error('Error al eliminar la venta');
      }
    }
  };

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

  const getClientePlaca = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.placa || 'N/A';
  };

  if (!trabajadorActual) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acceso Requerido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Debes seleccionar un trabajador para registrar ventas.
            </p>
            <p className="text-sm text-gray-500">
              Ve al menú lateral y selecciona o agrega un trabajador.
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
          <h1 className="text-3xl font-bold text-gray-900">Registro de Ventas</h1>
          <p className="text-gray-600 mt-1">
            Trabajador: {trabajadorActual.nombre}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/clientes">
            <Button variant="outline">
              Gestionar Clientes
            </Button>
          </Link>
        </div>
      </div>

      {/* Imagen de cabecera - Oculta en móvil */}
      <div className="relative hidden lg:block">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/24dc0884-d822-4b37-a221-b3cba042f0c6.png" 
          alt="Interfaz moderna para registro de ventas de agua con formularios intuitivos"
          className="w-full h-32 object-cover rounded-xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xl font-bold">Registrar Nueva Venta</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Formulario de registro */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Venta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Buscador de cliente */}
                <div>
                  <Label className="text-base font-medium">Cliente</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Busca por nombre o placa del vehículo
                  </p>
                  <ClienteSearcher
                    onClienteSelected={(cliente) => {
                      setClienteSeleccionado(cliente);
                      if (cliente) {
                        // Auto-llenar galones con la capacidad del vehículo
                        setGalones(cliente.capacidadGalones.toString());
                        // Sugerir precio basado en el tipo de cliente
                        const precioSugerido = cliente.tipoCliente === 'credito' ? '10' : '5';
                        setPrecioTotal(precioSugerido);
                        // Establecer estado de pago según tipo de cliente
                        setPagado(cliente.tipoCliente === 'corriente');
                      }
                    }}
                    selectedCliente={clienteSeleccionado}
                    placeholder="Escribe el nombre del cliente o placa..."
                  />
                </div>

                {/* Galones */}
                <div>
                  <Label htmlFor="galones" className="text-base font-medium">
                    Cantidad de Galones
                  </Label>
                  <Input
                    id="galones"
                    type="number"
                    step="0.1"
                    min="0"
                    value={galones}
                    onChange={(e) => setGalones(e.target.value)}
                    placeholder="Ej: 100"
                    className="mt-2"
                    required
                  />
                  {clienteSeleccionado && (
                    <p className="text-sm text-gray-500 mt-1">
                      Capacidad del vehículo: {clienteSeleccionado.capacidadGalones} galones
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div>
                  <Label htmlFor="precio" className="text-base font-medium">
                    Precio Total
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioTotal}
                    onChange={(e) => setPrecioTotal(e.target.value)}
                    placeholder="Ej: 5, 10 o 14"
                    className="mt-2"
                    required
                  />
                  {galones && precioTotal && (
                    <p className="text-sm text-gray-500 mt-1">
                      Precio por galón: {formatCurrency(parseFloat(precioTotal) / parseFloat(galones))}
                    </p>
                  )}
                </div>

                {/* Estado de pago */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Estado de Pago</Label>
                    <p className="text-sm text-gray-500">
                      ¿El cliente pagó la venta?
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${!pagado ? 'font-medium text-orange-600' : 'text-gray-500'}`}>
                      Debe
                    </span>
                    <Switch
                      checked={pagado}
                      onCheckedChange={setPagado}
                    />
                    <span className={`text-sm ${pagado ? 'font-medium text-green-600' : 'text-gray-500'}`}>
                      Pagado
                    </span>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <Label htmlFor="notas" className="text-base font-medium">
                    Notas (Opcional)
                  </Label>
                  <Textarea
                    id="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Observaciones adicionales..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !clienteSeleccionado}
                    className="flex-1"
                  >
                    {loading ? 'Registrando...' : 'Registrar Venta'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumen del día */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-4">
                <div className="text-center p-3 lg:p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg lg:text-2xl font-bold text-blue-600">
                    {ventasHoy.length}
                  </div>
                  <p className="text-xs lg:text-sm text-blue-700">Ventas</p>
                </div>
                
                <div className="text-center p-3 lg:p-4 bg-green-50 rounded-lg">
                  <div className="text-lg lg:text-2xl font-bold text-green-600">
                    {ventasHoy.reduce((sum, v) => sum + v.galones, 0).toLocaleString()}
                  </div>
                  <p className="text-xs lg:text-sm text-green-700">Galones</p>
                </div>

                <div className="text-center p-3 lg:p-4 bg-emerald-50 rounded-lg">
                  <div className="text-sm lg:text-lg font-bold text-emerald-600">
                    {formatCurrency(ventasHoy.filter(v => v.pagado).reduce((sum, v) => sum + v.precioTotal, 0))}
                  </div>
                  <p className="text-xs lg:text-sm text-emerald-700">Ingresos</p>
                </div>

                <div className="text-center p-3 lg:p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm lg:text-lg font-bold text-orange-600">
                    {formatCurrency(ventasHoy.filter(v => !v.pagado).reduce((sum, v) => sum + v.precioTotal, 0))}
                  </div>
                  <p className="text-xs lg:text-sm text-orange-700">Pendiente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de ventas del día */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {ventasHoy.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay ventas registradas hoy</p>
              <p className="text-sm mt-1">Las ventas aparecerán aquí una vez que las registres</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ventasHoy.reverse().map((venta) => (
                <div
                  key={venta.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">
                        {getClienteNombre(venta.clienteId)}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {getClientePlaca(venta.clienteId)}
                      </Badge>
                      <Badge variant={venta.pagado ? "default" : "destructive"}>
                        {venta.pagado ? "Pagado" : "Debe"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{venta.galones} galones</span>
                      <span>{formatCurrency(venta.precioTotal)}</span>
                      <span>{formatDate(venta.fecha)}</span>
                    </div>
                    {venta.notas && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {venta.notas}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditVenta(venta)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteVenta(venta.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar venta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Venta</DialogTitle>
          </DialogHeader>
          {ventaEditando && (
            <EditVentaForm
              venta={ventaEditando}
              onSave={handleUpdateVenta}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para editar venta
interface EditVentaFormProps {
  venta: Venta;
  onSave: (venta: Venta) => void;
  onCancel: () => void;
}

const EditVentaForm: React.FC<EditVentaFormProps> = ({ venta, onSave, onCancel }) => {
  const [galones, setGalones] = useState(venta.galones.toString());
  const [precioTotal, setPrecioTotal] = useState(venta.precioTotal.toString());
  const [pagado, setPagado] = useState(venta.pagado);
  const [notas, setNotas] = useState(venta.notas || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ventaActualizada: Venta = {
      ...venta,
      galones: parseFloat(galones),
      precioTotal: parseFloat(precioTotal),
      pagado,
      notas: notas.trim() || undefined
    };

    onSave(ventaActualizada);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-galones">Galones</Label>
        <Input
          id="edit-galones"
          type="number"
          step="0.1"
          value={galones}
          onChange={(e) => setGalones(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-precio">Precio Total</Label>
        <Input
          id="edit-precio"
          type="number"
          step="0.01"
          value={precioTotal}
          onChange={(e) => setPrecioTotal(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Estado de Pago</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm">Debe</span>
          <Switch checked={pagado} onCheckedChange={setPagado} />
          <span className="text-sm">Pagado</span>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-notas">Notas</Label>
        <Textarea
          id="edit-notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Guardar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
};
