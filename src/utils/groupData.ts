import type {Persona, GroupedData, PersonaMorosidadAgrupada, PersonaPropiedadAgrupada} from "../utils/types"

export const groupDataForEmail = (listaPlana: Persona[]): GroupedData[] => {
  // ... (Filtros de morosidad y propiedadRecords se mantienen igual) ...
  const morosidadRecords = listaPlana.filter(
    (p) => p.servicio !== null && p.servicio !== undefined && p.servicio !== ""
  );
  const propiedadRecords = listaPlana.filter(
    (p) => p.servicio === null || p.servicio === undefined || p.servicio === ""
  );

  const groupedResults: GroupedData[] = [];

  // --- MOROSIDAD ---
  const morosidadMap = new Map<string, PersonaMorosidadAgrupada>();

  morosidadRecords.forEach((p) => {
    if (!morosidadMap.has(p.cedula)) {
      // ... (Inicialización de persona se mantiene igual) ...
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
    const deudaValor = Number(p.valorDeLaDeuda) || 0; // Asegurar que sea número

    // Finca
    let fincaRecord = persona.fincas.find((f) => f.numero === p.numeroDeFinca);
    if (!fincaRecord) {
      fincaRecord = {
        numero: p.numeroDeFinca,
        numeroDeCuenta: p.numeroDeCuenta,
        servicios: [],
      };
      persona.fincas.push(fincaRecord);
    }

    // Servicio (Agrupado por CodServicio)
    let servicioRecord = fincaRecord.servicios.find(
      (s) => s.codServicio === p.CodServicio
    );
    if (!servicioRecord) {
      servicioRecord = {
        codServicio: p.CodServicio,
        nombre: p.servicio ?? "Servicio sin nombre",
        totalDeuda: 0,
        periodoDesde: p.periodo,
        periodoHasta: p.periodo,
        periodosAtrasados: 0,
        cuentas: [],
      };
      fincaRecord.servicios.push(servicioRecord);
    }

    // Cuentas (Para obtener el conteo de periodos y el rango)
    servicioRecord.cuentas.push({
      deuda: deudaValor,
      vencimiento: p.fechaVencimiento,
      periodo: p.periodo,
    });

    // Acumulados y Resumen
    servicioRecord.totalDeuda += deudaValor;
    servicioRecord.periodoDesde = Math.min(
      servicioRecord.periodoDesde,
      p.periodo
    );
    servicioRecord.periodoHasta = Math.max(
      servicioRecord.periodoHasta,
      p.periodo
    );
    servicioRecord.periodosAtrasados = servicioRecord.cuentas.length; // El número de registros es el número de períodos

    persona.totalDeuda += deudaValor;
  });

  morosidadMap.forEach((data) =>
    groupedResults.push({ tipo: "Morosidad", data })
  );

  //Agrupación por propiedades
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
      valor: p.montoImponible,
    });
  });

  propiedadMap.forEach((data) =>
    groupedResults.push({ tipo: "Propiedad", data })
  );

  return groupedResults;
};
