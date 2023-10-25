import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandle } from './middlewares/error.middlewares'
const app = express()
app.use(express.json())
const port = 3000
databaseService.connect().catch(console.dir)
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/users', usersRouter)
// localhost:3000/users/tweets

// tập kết lỗi
app.use(defaultErrorHandle)
app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
