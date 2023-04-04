import cors from "@fastify/cors";
import Fastify from "fastify";
import { appRoutes } from "./routes";

const app = Fastify()

app.register(cors)
app.register(appRoutes)

app.get('/', () => {
  return 'hello world'
})

app.listen({
  port: 3333
}).then(() => console.log('Navegando... ⛵🏴‍☠️'))
