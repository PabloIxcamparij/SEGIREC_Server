export type Persona = {
  cedula: string;
  nombre: string;
  correo: string;
  distrito: string;
  numeroDeFinca: string;
  servicio: string | null;
  CodServicio: string;
  valorDeLaDeuda: number;
  fechaVencimiento: string;
  numeroDeCuenta: string;
  periodo: number;
  telefono: string;
  direccion: string;
  areaDeLaPropiedad: number;
  fechaVigencia: string;
  estadoPropiedad: string;
  montoImponible: number;
  codigoBaseImponible: string;
  numeroDeDerecho: string;
};

export interface PersonaPropiedadAgrupada {
  cedula: string;
  nombreCompleto: string;
  correo: string;
  fincas: Array<{
    numero: string;
    derecho: string;
    valor: number;
  }>;
}

export interface PersonaMorosidadAgrupada {
  cedula: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  direccion: string;
  totalDeuda: number;
  fincas: Array<{
    numero: string;
    numeroDeCuenta: string;
    servicios: Array<{
      codServicio: string;
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