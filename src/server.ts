import express from 'express'
import bodyParser from 'body-parser'

import routes from './routes/index'
import { io } from './sockets'

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use('/api', routes)

const server = app.listen(port, err => {
  if (err) {
    return console.error(err)
  }
  return console.log(`server is listening on ${port}`)
})

io.attach(server)