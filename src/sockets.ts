import socketIO from 'socket.io'

const io = socketIO()

io.on('connection', (socket) => {
  console.log('++ client connected ++')

  socket.on('disconnect', (reason) => {
    console.log('-- client disconnected --')
    console.log('reason:', reason, '\n')
  })
})

export { io }
