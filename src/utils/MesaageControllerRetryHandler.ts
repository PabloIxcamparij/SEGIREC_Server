/**
 * Ejecuta una función asíncrona y la reintenta en caso de fallo.
 * @param fn Función a ejecutar
 * @param retries Número de reintentos
 * @param delay Tiempo de espera entre intentos (ms)
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 2000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    // Esperar antes de reintentar
    await new Promise((resolve) => setTimeout(resolve, delay));
    console.warn(`Reintentando operación... Quedan ${retries} intentos.`);
    return withRetry(fn, retries - 1, delay * 2); // Aumentamos el delay en cada fallo
  }
};