import server from "./server"
import colors from "colors"
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const port = process.env.PORT || 4000
server.listen(port, () =>{
 console.log(colors.cyan(`Rest API in the port ${port}`))
} )

