"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Cliente } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClienteSearcherProps {
  onClienteSelected: (cliente: Cliente | null) => void;
  selectedCliente?: Cliente | null;
  placeholder?: string;
}

export const ClienteSearcher: React.FC<ClienteSearcherProps> = ({
  onClienteSelected,
  selectedCliente,
  placeholder = "Buscar cliente por nombre o placa..."
}) => {
  const { buscarClientes, getClienteConGalones } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Buscar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const clientes = buscarClientes(searchTerm);
      setResultados(clientes);
      setIsOpen(clientes.length > 0);
      setHighlightedIndex(-1);
    } else {
      setResultados([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [searchTerm, buscarClientes]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || resultados.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < resultados.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : resultados.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < resultados.length) {
          handleSelectCliente(resultados[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    const clienteConGalones = getClienteConGalones(cliente.id);
    if (clienteConGalones) {
      onClienteSelected(clienteConGalones);
      setSearchTerm(`${cliente.nombre} - ${cliente.placa}`);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClearSelection = () => {
    setSearchTerm('');
    onClienteSelected(null);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const formatGalones = (galones: number) => {
    return galones.toLocaleString('es-CO');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full"
            autoComplete="off"
          />
          
          {/* Dropdown de resultados */}
          {isOpen && resultados.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
              <CardContent className="p-0">
                {resultados.map((cliente, index) => {
                  const clienteConGalones = getClienteConGalones(cliente.id);
                  const totalGalones = clienteConGalones?.totalGalones || 0;
                  
                  return (
                    <div
                      key={cliente.id}
                      className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                        index === highlightedIndex 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectCliente(cliente)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {cliente.nombre}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {cliente.placa}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Capacidad: {cliente.capacidadGalones} gal</span>
                            <span>Total consumido: {formatGalones(totalGalones)} gal</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {cliente.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Mensaje cuando no hay resultados */}
          {isOpen && searchTerm.trim() && resultados.length === 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
              <CardContent className="p-4 text-center text-gray-500">
                <p>No se encontraron clientes</p>
                <p className="text-xs mt-1">
                  Busca por nombre o placa del vehículo
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botón para limpiar selección */}
        {selectedCliente && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSelection}
            className="px-3"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Información del cliente seleccionado */}
      {selectedCliente && (
        <Card className="mt-3 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">
                  {selectedCliente.nombre}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-blue-700">
                  <span>Placa: {selectedCliente.placa}</span>
                  <span>Capacidad: {selectedCliente.capacidadGalones} gal</span>
                  <span>Total consumido: {formatGalones(selectedCliente.totalGalones || 0)} gal</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-600">
                  Cliente Seleccionado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ayuda de navegación */}
      {isOpen && resultados.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
          <span>↑↓ Navegar</span>
          <span>Enter Seleccionar</span>
          <span>Esc Cerrar</span>
        </div>
      )}
    </div>
  );
};
