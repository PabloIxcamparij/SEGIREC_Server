# Sistema de Gestión y Envío de Mensajes

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.37.3-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Tabla de Contenidos
- [Descripción](#descripción)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Rutas y Controladores](#rutas-y-controladores)
- [Base de Datos](#base-de-datos)
- [Middlewares](#middlewares)
- [Testeos](#testeos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Documentación](#documentación)
- [Monitoreo](#monitoreo)

## Descripción

Backend desarrollado con Node.js y Express que proporciona una API RESTful completa para autenticación, gestión de usuarios y sistema de envío de mensajes masivos por correo electrónico y WhatsApp.

## Arquitectura del Sistema

### Estructura de Rutas

```typescript
// Configuración principal del servidor
server.use("/auth", routerAuth);        // Autenticación y autorización
server.use("/admin", routerAdmin);      // Gestión de usuarios (CRUD)
server.use("/utils", routerUtils);      // Catálogos y utilidades
server.use("/message", sendMessage);    // Envío de mensajes
server.use("/queryPeople", queryPeople); // Consultas complejas de personas
```

## Stack Tecnológico

### Backend Principal
- **Node.js** - Entorno de ejecución
- **Express 4.19.2** - Framework web
- **TypeScript 5.5.4** - Tipado estático
- **Sequelize 6.37.3** - ORM para PostgreSQL
- **JWT 9.0.2** - Tokens de autenticación

### Servicios de Mensajería
- **Nodemailer 7.0.5** - Envío de correos electrónicos
- **API de WhatsApp** - Integración para mensajería instantánea

### Seguridad y Utilidades
- **bcrypt 6.0.0** - Hash de contraseñas
- **cors 2.8.5** - Control de acceso HTTP

```typescript
// Configuración de seguridad
// Se debe configurar por env la dirección del Frontend para aceptarlo
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    console.log("Origin recibido:", origin);
    if (!origin || process.env.FRONTEND_URL.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Bloqueado por CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
```

- **express-validator 7.2.0** - Validación de datos
- **cookie-parser 1.4.7** - Manejo de cookies

## Rutas y Controladores

### Sistema de Autenticación y Autorización
```typescript
// auth.route
- Se realiza el login al sistema, verificando credenciales y generando un JWT como cookie. (/auth/login)
- Se hace el cierre de sesión del usuario eliminando el JWT de haberlo de su navegador. (/auth/logout)
- Se verifica la integridad de dicho JWT como parte de la seguridad de la sesión, vencimiento o modificación del JWT. (/auth/verifyAuth)
- Se verifican los roles del usuario para permitirle navegar a ciertas páginas de la aplicación Frontend. (/auth/verifyRol)
```

### Sistema de Envío de Mensajes

#### Flujo Completo de Envío

##### 1. **Agrupación de Datos**
```typescript
// utils/groupData.ts
// Agrupa personas duplicadas para evitar envíos múltiples
- Identifica registros duplicados por persona
- Consolida información para un solo envío
- Optimiza el proceso de mensajería
```

##### 2. **Procesamiento de Templates**
```typescript
// utils/emailTemplateService.ts
// Carga y gestiona plantillas desde la base de datos
- Pre-carga de templates al iniciar el servidor
- Selección dinámica según tipo de mensaje
- Personalización de contenido
```

##### 3. **Sistema de Autorización para Envíos Prioritarios**

###### Solicitud de Código (`requestCodePrioritaryMessage`)
```typescript
// Flujo de seguridad para envíos especiales
1. Verificación de usuario autenticado
2. Validación de opciones (WhatsApp y/o Priority)
3. Búsqueda del primer administrador activo
4. Generación de código de 6 dígitos
5. Envío por email al administrador
6. Almacenamiento temporal con expiración de 5 minutos
```

###### Confirmación de Código (`confirmCodePrioritaryMessage`)
```typescript
// Verificación y generación de token especial
1. Validación del código ingresado
2. Verificación de intentos y expiración
3. Generación de token JWT especial
4. Token válido por 60 segundos con permisos específicos
5. Limpieza del almacenamiento temporal
```

### Endpoints de Mensajería

#### Envíos Específicos
```typescript
POST /message/sendMessageOfPropiedades // La lista de personas se obtiene desde la BD y es entregada por el backend
POST /message/sendMessageOfMorosidad 
POST /message/sendMessageMassive // Se debe cargar una lista de personas desde el Front
// Requiere: lista de personas y un rol específico
```

### Consultas Avanzadas
```typescript
// queryPeople.route
- Filtros SQL complejos desde frontend
- Búsqueda optimizada en base de datos
- Entrega de listas para previsualización
```

### Gestión de Datos
```typescript
// utils.route
- Búsqueda y carga de tablas catálogo para el uso del Frontend
```

### Administración de Usuarios (Uso exclusivo de usuarios administradores)
```typescript
// admin.route
- Creación de nuevos usuarios
- Obtener todos los usuarios no eliminados
- Obtener un usuario por Id, no se cargará la contraseña de este
- Modificar los atributos de un usuario, control para que uno mismo no se pueda modificar atributos clave
- Eliminar, de forma lógica, un usuario, control para que uno mismo no sea aquel que puede eliminarse
```

## Middlewares

# Middlewares

## Descripción General
El sistema implementa una serie de middlewares para gestionar autenticación, autorización, validación, auditoría y notificaciones. Estos middlewares se ejecutan en secuencia para garantizar la seguridad y trazabilidad de las operaciones.

## Middlewares Implementados

### 1. authenticateMiddleware
**Propósito**: Verificar la autenticidad y validez del token JWT en cada solicitud.

```typescript
// Funcionalidades principales:
- Extrae el token JWT de las cookies (AuthToken)
- Verifica la firma y expiración del token
- Valida la existencia del usuario en la base de datos
- Implementa control de sesiones únicas mediante IdSesion
- Previene uso concurrente de múltiples sesiones
```

**Uso**: Aplicado a todas las rutas excepto login y logout

### 2. authorizeRolesMiddleware
**Propósito**: Control de acceso basado en roles del usuario.

```typescript
// Parámetros: ...rolesPermitidos: string[]
// Funcionalidades:
- Verifica roles del usuario autenticado
- Acceso total para rol "Administrador"
- Validación estática por lista de roles permitidos
- Validación dinámica por typeQuery en el body
- Manejo de roles múltiples separados por ";"
```

**Ejemplos de Uso**:
```typescript
// Validación estática
authorizeRolesMiddleware("Morosidad", "Propiedades")

// Validación dinámica (requiere typeQuery en body)
authorizeRolesMiddleware()
```

**Comportamiento**:
- **Administrador**: Acceso completo sin restricciones
- **Usuarios normales**: Validación contra rolesPermitidos
- **Validación dinámica**: Cuando se incluye `typeQuery` en el body

---

### 3. inputErrorsMiddleware
**Propósito**: Middleware de validación de datos de entrada usando express-validator.

```typescript
// Funcionalidades:
- Recoge resultados de validación de express-validator
- Retorna errores 400 con detalles de validación
- Permite continuar solo si no hay errores de validación
```

**Integración**:
- Se coloca después de las validaciones de express-validator
- Retorna array estructurado de errores de validación

---

### 4. activitiMiddleware
**Propósito**: Sistema completo de auditoría y trazabilidad de actividades.

```typescript
// Parámetros: (tipo: string, detalle: string)
// Tipos soportados: "Consulta", "EnvioMensajes", otros
```

**Estructura de Auditoría**:
```
ControlActividades (registro padre)
├── ConsultasTabla (actividades de consulta)
└── EnvioMensajes (actividades de envío)
```

**Registro por Tipo**:

#### Para Consultas:
```typescript
- Almacena filtros aplicados en formato legible
- Registra el usuario y timestamp
- Captura el estado de éxito/error
```

#### Para Envío de Mensajes:
```typescript
- Métricas de envío (totales, correos, WhatsApp)
- Resultados individuales por persona
- Detalles de éxito/fallo por canal
```

**Características**:
- Ejecución asíncrona sin bloquear la respuesta
- Captura automática del código de estado HTTP
- Almacenamiento en tablas relacionadas

---

### 5. emailNotificationMiddleware
**Propósito**: Sistema de notificaciones por correo electrónico para procesos de envío.

**Flujo de Notificaciones**:

#### Notificación de Inicio (Síncrona):
```typescript
- Se ejecuta inmediatamente al entrar al middleware
- Informa del inicio del proceso de envío
- Incluye: usuario, timestamp, ruta afectada
```

#### Notificación de Finalización (Asíncrona):
```typescript
- Se ejecuta al terminar la respuesta (res.on('finish'))
- Genera reporte completo con métricas
- Incluye tabla detallada de resultados individuales
- Métricas agregadas de envíos
```

**Estructura del Reporte**:
- Métricas generales (totales, correos, WhatsApp)
- Tabla detallada con estado por persona
- Formato HTML profesional para correo

**Características**:
- Ejecución no bloqueante
- Manejo robusto de errores en envío de correos
- Formateo consistente de notificaciones

---

## Secuencia Típica de Middlewares

```typescript
// Flujo completo para envío de mensajes
authenticateMiddleware → authorizeRolesMiddleware → inputErrorsMiddleware → activitiMiddleware → emailNotificationMiddleware → Controller
```

## Configuración y Uso

### Orden de Aplicación
1. **Seguridad**: authenticateMiddleware + authorizeRolesMiddleware
2. **Validación**: inputErrorsMiddleware  
3. **Auditoría**: activitiMiddleware
4. **Notificaciones**: emailNotificationMiddleware

### Consideraciones de Implementación
- Los middlewares de auditoría y notificación funcionan de forma asíncrona
- El control de sesiones únicas previene seguridad en entornos concurrentes
- El sistema de roles permite flexibilidad en control de acceso
- Las notificaciones por correo proporcionan trazabilidad externa

## Testeos

*Documentación de testeo pendiente de desarrollo*

## Base de Datos

```typescript
// Configuración Sequelize + PostgreSQL
- Migraciones automáticas al iniciar

async function ConnectDB() {
  try {
    await db.authenticate();
    await db.sync();
    console.log(colors.bgGreen.white("Conexión exitosa con la bd"));

    await runInitialMigration();
    await emailTemplateService.preloadAllTemplates();
  } catch (error) {
    console.log(colors.bgRed.white("Hubo un error en la conexión con la bd"));
    console.log(error);
  }
}

ConnectDB();

- Sincronización de modelos
- Conexión pool optimizada
```

```typescript
// Rutina para prevenir errores
- await runInitialMigration(); Creará un usuario administrador si no existe un usuario con ese rol o no hay usuarios en la BD
```

```typescript
// Rutina para que las plantillas de correos sean dinámicas
- await emailTemplateService.preloadAllTemplates(); Cargará las plantillas de correo creadas en la BD. Si se desean modificar, se debe reiniciar el servidor para que se carguen
```

```typescript
// Tomar en cuenta que las plantillas de correos hacen uso del siguiente tipo
// por lo cual estos serían los valores que se deben usar al modificar dicha plantilla

export interface PersonaPropiedadAgrupada {
  cedula: string;
  nombreCompleto: string;
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
  nombreCompleto: string;
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
```

## Instalación

### Instalación Local
```bash
# Clonar repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Configuración
```json
{
  "start": "node dist/index.js",
  "dev": "nodemon --exec ts-node src/index.ts", 
  "build": "tsc",
  "test": "jest --detectOpenHandles",
  "test:coverage": "jest --detectOpenHandles --coverage"
}
```

## Configuración

### Variables de Entorno Requeridas
```env
JWT_SECRET=clave_secreta_jwt
FRONTEND_URL=url_frontend
DATABASE_URL=url_conexion_postgresql

CORREO_USER=direccion_de_correo_electronico
CORREO_PASS=contraseña_de_dicho_correo_electronico

WHATSAPP_TOKEN=token_permanente_de_whatsApp
WHATSAPP_PHONE_ID=numero_de_telefono_registrado_en_whatsApp
WHATSAPP_API_URL=url_base_de_la_API
```

## Documentación

### Swagger Integration
```typescript
// Disponible en: /docs
- Documentación automática de endpoints
```

## Monitoreo

### Sistema de Actividades
```typescript
// activitiMiddleware
- Registro automático de las acciones de consulta avanzadas a la base de datos y envío de mensajes
- Categorización por tipo de operación
- Auditoría completa del sistema
```

---

*Este backend proporciona una base robusta y escalable para el sistema de mensajería masiva, con énfasis en seguridad, auditoría y flexibilidad en la gestión de envíos.*