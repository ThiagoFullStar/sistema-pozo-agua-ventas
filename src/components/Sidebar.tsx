"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    description: 'Resumen general'
  },
  {
    href: '/ventas',
    label: 'Ventas',
    description: 'Registrar ventas'
  },
  {
    href: '/clientes',
    label: 'Clientes',
    description: 'Gestionar clientes'
  },
  {
    href: '/reportes',
    label: 'Reportes',
    description: 'Ver estadísticas'
  }
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { trabajadores, trabajadorActual, agregarTrabajador, seleccionarTrabajador } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nuevoTrabajador, setNuevoTrabajador] = useState('');

  const handleAgregarTrabajador = async () => {
    if (!nuevoTrabajador.trim()) {
      toast.error('Por favor ingresa un nombre');
      return;
    }

    const success = await agregarTrabajador({ nombre: nuevoTrabajador.trim() });
    if (success) {
      toast.success('Trabajador agregado correctamente');
      setNuevoTrabajador('');
      setIsDialogOpen(false);
    } else {
      toast.error('Error al agregar trabajador');
    }
  };

  const handleSeleccionarTrabajador = async (trabajadorId: string) => {
    const success = await seleccionarTrabajador(trabajadorId);
    if (success) {
      toast.success('Trabajador seleccionado');
    } else {
      toast.error('Error al seleccionar trabajador');
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="w-full h-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg mb-4 flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">💧</div>
              <div className="text-xs text-blue-500 font-medium">AGUA</div>
            </div>
            <div className="absolute bottom-1 right-2 text-xs text-gray-400 opacity-60">
              CREATE POR THIAGO AMORES
            </div>
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            SISTEMAS POZO DE AGUA
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            JUAN MONTALVO
          </p>
        </div>

        {/* Selector de Trabajador */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Trabajador Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={trabajadorActual?.id || ''}
              onValueChange={handleSeleccionarTrabajador}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar trabajador" />
              </SelectTrigger>
              <SelectContent>
                {trabajadores.map((trabajador) => (
                  <SelectItem key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  Agregar Trabajador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Trabajador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Trabajador</Label>
                    <Input
                      id="nombre"
                      value={nuevoTrabajador}
                      onChange={(e) => setNuevoTrabajador(e.target.value)}
                      placeholder="Ingresa el nombre"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAgregarTrabajador();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAgregarTrabajador} className="flex-1">
                      Agregar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Navegación */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.description}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Info del trabajador actual */}
        {trabajadorActual && (
          <Card className="mt-6">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-semibold text-lg">
                    {trabajadorActual.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-sm">{trabajadorActual.nombre}</p>
                <p className="text-xs text-gray-500">Trabajador activo</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
