import type {
  GroupedData,
  Persona,
  PersonaMorosidadAgrupada,
  PersonaPropiedadAgrupada,
} from "./types";

export const groupDataForEmail = (listaPlana: Persona[]): GroupedData[] => {
  const groupedResults: GroupedData[] = [];

  // --- MOROSIDAD ---
  const morosidadRecords = listaPlana.filter((p) => p.servicio);
  const morosidadMap = new Map<string, PersonaMorosidadAgrupada>();

  morosidadRecords.forEach((p) => {
    // Normalizar valores
    const deudaValor = Number(p.valorDeLaDeuda) || 0;
    const periodoNum = Number(p.periodo) || 0;

    // Inicializar persona
    if (!morosidadMap.has(p.cedula)) {
      morosidadMap.set(p.cedula, {
        cedula: p.cedula,
        nombreCompleto: p.nombre,
        correo: p.correo,
        telefono: p.telefono,
        direccion: p.direccion,
        totalDeuda: 0,
        fincas: [],
      });
    }

    const persona = morosidadMap.get(p.cedula)!;

    // Buscar o crear finca
    let finca = persona.fincas.find((f) => f.numero === p.numeroDeFinca);
    if (!finca) {
      finca = {
        numero: p.numeroDeFinca,
        numeroDeCuenta: p.numeroDeCuenta,
        servicios: [],
      };
      persona.fincas.push(finca);
    }

    // Buscar o crear servicio (ahora sí usa 'codigoServicio')
    let servicio = finca.servicios.find(
      (s) => s.codigoServicio === p.codigoServicio
    );
    if (!servicio) {
      servicio = {
        codigoServicio: p.codigoServicio,
        nombre: p.servicio ?? "Servicio sin nombre",
        totalDeuda: 0,
        periodoDesde: periodoNum,
        periodoHasta: periodoNum,
        periodosAtrasados: 0,
        cuentas: [],
      };
      finca.servicios.push(servicio);
    }

    // Agregar cuenta
    servicio.cuentas.push({
      deuda: deudaValor,
      vencimiento: p.fechaVencimiento,
      periodo: periodoNum,
    });

    // Actualizar totales
    servicio.totalDeuda += deudaValor;
    servicio.periodoDesde = Math.min(servicio.periodoDesde, periodoNum);
    servicio.periodoHasta = Math.max(servicio.periodoHasta, periodoNum);
    servicio.periodosAtrasados = servicio.cuentas.length;

    persona.totalDeuda += deudaValor;
  });

  // Agregar al resultado final
  morosidadMap.forEach((data) =>
    groupedResults.push({ tipo: "Morosidad", data })
  );

  // --- PROPIEDADES ---
  const propiedadRecords = listaPlana.filter((p) => !p.servicio);
  const propiedadMap = new Map<string, PersonaPropiedadAgrupada>();

  propiedadRecords.forEach((p) => {
    if (!propiedadMap.has(p.cedula)) {
      propiedadMap.set(p.cedula, {
        cedula: p.cedula,
        nombreCompleto: p.nombre,
        correo: p.correo,
        fincas: [],
      });
    }

    const persona = propiedadMap.get(p.cedula)!;
    persona.fincas.push({
      numero: p.numeroDeFinca,
      derecho: p.numeroDeDerecho,
      valor: Number(p.montoImponible),
    });
  });

  propiedadMap.forEach((data) =>
    groupedResults.push({ tipo: "Propiedad", data })
  );

  return groupedResults;
};
