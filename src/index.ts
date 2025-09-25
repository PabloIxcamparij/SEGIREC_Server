import server from "./server";

// Exporta la instancia de Express para que Vercel la pueda usar.
// El puerto y el listen() son manejados automáticamente por Vercel.
export default server; 

// Si aún quieres mantener la funcionalidad de desarrollo local:
/*
import colors from "colors"
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000
    server.listen(port, () =>{
        console.log(colors.cyan(`Rest API in the port ${port}`))
    })
}
*/