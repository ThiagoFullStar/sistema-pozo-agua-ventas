"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Cliente } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ClientesPage() {
  const { 
    clientes, 
    agregarCliente, 
    actualizarCliente, 
    eliminarCliente,
    buscarClientes,
    getClienteConGalones
  } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [placa, setPlaca] = useState('');
  const [capacidadGalones, setCapacidadGalones] = useState('');
  const [tipoCliente, setTipoCliente] = useState<'corriente' | 'credito'>('corriente');
  const [loading, setLoading] = useState(false);

  const clientesFiltrados = searchTerm.trim() 
    ? buscarClientes(searchTerm)
    : clientes;

  const resetForm = () => {
    setNombre('');
    setPlaca('');
    setCapacidadGalones('');
    setTipoCliente('corriente');
    setClienteEditando(null);
  };

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setClienteEditando(cliente);
      setNombre(cliente.nombre);
      setPlaca(cliente.placa);
      setCapacidadGalones(cliente.capacidadGalones.toString());
      setTipoCliente(cliente.tipoCliente || 'corriente');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error('Por favor ingresa el nombre del cliente');
      return;
    }

    if (!placa.trim()) {
      toast.error('Por favor ingresa la placa del vehículo');
      return;
    }

    if (!capacidadGalones || parseFloat(capacidadGalones) <= 0) {
      toast.error('Por favor ingresa una capacidad válida');
      return;
    }

    // Verificar si la placa ya existe (solo para nuevos clientes)
    if (!clienteEditando) {
      const placaExiste = clientes.some(c => 
        c.placa.toLowerCase() === placa.trim().toLowerCase()
      );
      if (placaExiste) {
        toast.error('Ya existe un cliente con esta placa');
        return;
      }
    }

    setLoading(true);

    try {
      const clienteData = {
        nombre: nombre.trim(),
        placa: placa.trim().toUpperCase(),
        capacidadGalones: parseFloat(capacidadGalones),
        tipoCliente
      };

      let success = false;

      if (clienteEditando) {
        // Actualizar cliente existente
        success = await actualizarCliente({
          ...clienteEditando,
          ...clienteData
        });
        if (success) {
          toast.success('Cliente actualizado correctamente');
        }
      } else {
        // Agregar nuevo cliente
        success = await agregarCliente(clienteData);
        if (success) {
          toast.success('Cliente agregado correctamente');
        }
      }

      if (success) {
        handleCloseDialog();
      } else {
        toast.error('Error al guardar el cliente');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${cliente.nombre}?`)) {
      const success = await eliminarCliente(cliente.id);
      if (success) {
        toast.success('Cliente eliminado correctamente');
      } else {
        toast.error('Error al eliminar el cliente');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">
            Administra la información de tus clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              Agregar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {clienteEditando ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Cliente</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div>
                <Label htmlFor="placa">Placa del Vehículo</Label>
                <Input
                  id="placa"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacidad">Capacidad en Galones</Label>
                <Input
                  id="capacidad"
                  type="number"
                  step="0.1"
                  min="0"
                  value={capacidadGalones}
                  onChange={(e) => setCapacidadGalones(e.target.value)}
                  placeholder="Ej: 100"
                  required
                />
              </div>

              <div>
                <Label>Tipo de Cliente</Label>
                <Select value={tipoCliente} onValueChange={(value: 'corriente' | 'credito') => setTipoCliente(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corriente">Corriente (Pago inmediato)</SelectItem>
                    <SelectItem value="credito">Crédito (Pago posterior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Guardando...' : (clienteEditando ? 'Actualizar' : 'Agregar')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Imagen de cabecera */}
      <div className="relative">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1d34033f-7ef2-434c-8aae-41825b934821.png" 
          alt="Interfaz moderna para gestión de clientes con diseño limpio y funcional"
          className="w-full h-32 object-cover rounded-xl"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xl font-bold">Base de Datos de Clientes</h2>
            <p className="text-sm mt-1">Información completa y organizada</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {clientes.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Capacidad Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clientes.length > 0 
                ? Math.round(clientes.reduce((sum, c) => sum + c.capacidadGalones, 0) / clientes.length)
                : 0
              } gal
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por vehículo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Capacidad Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {clientes.reduce((sum, c) => sum + c.capacidadGalones, 0).toLocaleString()} gal
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Todos los vehículos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o placa..."
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Clientes 
            {searchTerm && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({clientesFiltrados.length} resultados)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? (
                <>
                  <p>No se encontraron clientes</p>
                  <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                </>
              ) : (
                <>
                  <p>No hay clientes registrados</p>
                  <p className="text-sm mt-1">Agrega tu primer cliente para comenzar</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((cliente) => {
                const clienteConGalones = getClienteConGalones(cliente.id);
                const totalGalones = clienteConGalones?.totalGalones || 0;
                
                return (
                  <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {cliente.nombre}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {cliente.placa}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {cliente.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Capacidad:</span>
                          <span className="font-medium">{cliente.capacidadGalones} gal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total consumido:</span>
                          <span className="font-medium text-green-600">
                            {totalGalones.toLocaleString()} gal
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Registrado:</span>
                          <span>{formatDate(cliente.fechaRegistro)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(cliente)}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCliente(cliente)}
                          className="flex-1"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
