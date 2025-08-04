"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const MobileHeader: React.FC = () => {
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
    <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex-1 relative">
          <h1 className="text-lg font-bold text-gray-900">
            SISTEMAS POZO DE AGUA
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            JUAN MONTALVO
          </p>
          <div className="absolute -bottom-1 left-0 text-xs text-gray-300 opacity-50">
            CREATE POR THIAGO AMORES
          </div>
        </div>
        
        {/* Selector de trabajador compacto */}
        <div className="flex items-center space-x-2">
          {trabajadorActual ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {trabajadorActual.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <Select
                value={trabajadorActual.id}
                onValueChange={handleSeleccionarTrabajador}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-center">
              <Select onValueChange={handleSeleccionarTrabajador}>
                <SelectTrigger className="w-40 h-8 text-xs">
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
            </div>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                +
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Trabajador</DialogTitle>
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
        </div>
      </div>
    </div>
  );
};
