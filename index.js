import express from 'express'
import { bootstrap } from './src/app.controller.js'
import dotenv from 'dotenv'
import path from 'node:path'
import { runIo } from './src/modules/socket/socket.controller.js'
dotenv.config({ path: path.resolve('./src/config/.env.dev') })
const app = express()
const port = process.env.PORT


bootstrap(app, express)


const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

runIo(httpServer)