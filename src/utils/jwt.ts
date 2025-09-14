import jwt from 'jsonwebtoken';

export const generateToken = (user: any) => {
    // Asegúrate de que el objeto 'user' que le pasas tenga la propiedad 'Rol'
    const payload = {
        id: user.id,
        email: user.Correo, // Usar Correo para coincidir con tu modelo
        rol: user.Rol // Añadir el rol al payload del token
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};