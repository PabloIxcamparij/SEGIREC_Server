// utils/codeStore.ts
type PendingOptions = { whatsApp: boolean; priority: boolean };

type CodeEntry = {
  adminEmail: string;
  code: string;
  expiresAt: number;
  attempts: number;
  pendingOptions: PendingOptions;
};

const CODE_MAP: Map<string | number, CodeEntry> = new Map();

export const MAX_ATTEMPTS = 3;
export const VALIDITY_TIME_MS = 5 * 60 * 1000; // 5 min

/**
 * Genera un código de 6 dígitos y lo almacena.
 * @param {string} email - Correo del administrador.
 * @returns {string} El código generado.
 */

export const generateAndStoreCodeFor = (
  userId: string | number,
  adminEmail: string,
  options: PendingOptions
) => {
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  const entry: CodeEntry = {
    adminEmail,
    code: newCode,
    expiresAt: Date.now() + VALIDITY_TIME_MS,
    attempts: 0,
    pendingOptions: options,
  };

  CODE_MAP.set(userId, entry);
  console.log(`[Seguridad] Código generado para user=${userId}, admin=${adminEmail}: ${newCode}`, options);
  return newCode;
};

/**
 * Verifica si el código proporcionado es correcto y no ha expirado.
 * @param {string} userId - ID del usuario al que se le envió el código.
 * @param {string} submittedCode - El código que el usuario ingresó.
 * @returns {boolean} True si es válido, False en caso contrario.
 */

export const verifyCodeFor = (userId: string | number, submittedCode: string) => {
  const entry = CODE_MAP.get(userId);
  if (!entry) return { success: false, error: "No se solicitó código para este usuario." };

  if (Date.now() > entry.expiresAt) {
    CODE_MAP.delete(userId);
    return { success: false, error: "Código expirado." };
  }

  if (entry.code === submittedCode) {
    // éxito (no borramos aquí: lo harás después cuando emitas token)
    return { success: true };
  }

  // incorrecto -> incrementar intentos
  entry.attempts += 1;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - entry.attempts);

  if (entry.attempts >= MAX_ATTEMPTS) {
    CODE_MAP.delete(userId);
    return { success: false, error: "Límite de intentos superado.", attemptsRemaining: 0 };
  }

  // actualizar mapa con el nuevo attempts
  CODE_MAP.set(userId, entry);
  return { success: false, error: "Código incorrecto.", attemptsRemaining: attemptsLeft };
};

/**
 * Obtiene la entrada del código para un usuario.
 * @param userId Id del usuario.
 * @returns Retorna la entrada del código o undefined si no existe.
 */

export const getCodeEntry = (userId: string | number): CodeEntry | undefined => {
  return CODE_MAP.get(userId);
};

/**
 * Limpia la entrada del código para un usuario.
 * @param userId Id del usuario.
 */

export const clearCodeStoreFor = (userId: string | number) => {
  CODE_MAP.delete(userId);
};
