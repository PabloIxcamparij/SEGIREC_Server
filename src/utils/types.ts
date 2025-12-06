// === Tipos ===

export type User = {
  id: number | string;
  Correo: string;
  Rol: string;
  IdSesion: string | number;
}

export type Persona = {
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  numeroDeCuenta: number;
  numeroDeFinca: string;
  servicio: string | null;
  codigoServicio: string;
  valorDeLaDeuda: string | number;
  fechaVencimiento: string;
  periodo: string | number;
  distrito: string;
  areaDeLaPropiedad?: number;
  fechaVigencia?: string;
  estadoPropiedad?: string;
  montoImponible?: number;
  codigoBaseImponible?: string;
  numeroDeDerecho?: string;
};

export interface PersonaPropiedadAgrupada {
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  fincas: Array<{
    numero: string;
    derecho?: string;
    valor?: number;
  }>;
}

export interface PersonaMorosidadAgrupada {
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  totalDeuda: number;
  fincas: Array<{
    numero: string;
    numeroDeCuenta: number;
    servicios: Array<{
      codigoServicio: string;
      nombre: string;
      totalDeuda: number;
      periodoDesde: number;
      periodoHasta: number;
      periodosAtrasados: number;
      cuentas: Array<{
        deuda: number;
        vencimiento: string;
        periodo: number;
      }>;
    }>;
  }>;
}

export type GroupedData = {
  tipo: "Propiedad" | "Morosidad";
  data: PersonaPropiedadAgrupada | PersonaMorosidadAgrupada;
};