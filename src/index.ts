import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandle } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'

config()
const app = express()
app.use(express.json())
const port = process.env.PORT || 4000
initFolder()
app.use(express.json())
databaseService.connect().catch(console.dir)
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/users', usersRouter)
// localhost:3000/users/tweets
app.use('/users', usersRouter) //route handler
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
// app.use('/static', express.static(UPLOAD_DIR))
// tập kết lỗi
app.use(defaultErrorHandle)
app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
