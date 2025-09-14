import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User from "../models/User.model";

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const bearer = req.headers.authorization

    if (!bearer) {
        // Si no hay token, enviamos la respuesta y retornamos inmediatamente
        const error = new Error("No Autorizado")
        return res.status(401).json({ error: error.message })
    }

    const [, token] = bearer.split(" ")

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (typeof decoded === "object" && decoded.id) {
            const user = await User.findByPk(decoded.id)
            if (user) {
                req.user = user
                next() 
            } else {
                return res.status(403).json({ error: "Token No Valido: Usuario no encontrado" })
            }
        } else {
            return res.status(403).json({ error: "Token No Valido: Formato incorrecto" })
        }

    } catch (error) {
        return res.status(403).json({ error: "Token No Valido" })
    }
}