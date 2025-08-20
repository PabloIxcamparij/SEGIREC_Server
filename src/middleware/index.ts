
import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator";

export const handlerInputErrors = (req:Request, res:Response, next:NextFunction) => {
   
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // El next se usa porque en el raouter se lee linealmente el codigo,
    // es decir que de cada parte se va a la otra,
    // el next hace que pase a la siguiente linea.
    
    next()
}

