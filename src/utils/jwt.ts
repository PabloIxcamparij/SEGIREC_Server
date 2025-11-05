import jwt from 'jsonwebtoken';

//Usaremos esta función para generar el token estándar
export const generateToken = (user: any) => {
    const payload = {
        id: user.id,
        email: user.Correo,
        rol: user.Rol,
        IdSesion: user.IdSesion,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Usaremos esta función para generar el token de corta duración (60 segundos)
export const generatePriorityToken = (userId, adminEmail) => {
    const payload = {
        id: userId,
        email: adminEmail,
        priorityAccess: true, // El permiso clave
    };
    // Token de MUY CORTA DURACIÓN (ej. 60 segundos)
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60s' }); 
};