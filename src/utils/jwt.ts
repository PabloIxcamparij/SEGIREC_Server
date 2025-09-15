import jwt from 'jsonwebtoken';

export const generateToken = (user: any) => {
    const payload = {
        id: user.id,
        email: user.Correo,
        rol: user.Rol 
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1m' });
};