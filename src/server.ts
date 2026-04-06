import { createHttpServer } from "./server/http-server.js"

const port = Number(process.env.PORT ?? "4173")
const server = createHttpServer()

server.listen(port, () => {
  console.log(`Naver Blog Exporter running at http://localhost:${port}`)
})
