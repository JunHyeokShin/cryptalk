import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    console.log(`${socket.id} 유저가 소켓에 연결되었습니다.`)
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId)
      console.log(
        `${socket.id} 유저가 채팅방 ${conversationId}에 입장하였습니다.`
      )
    })

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId)
      console.log(
        `${socket.id} 유저가 채팅방 ${conversationId}에서 퇴장하였습니다.`
      )
    })

    socket.on('send_message', (message) => {
      console.log(`${socket.id} 유저가 메시지를 보냈습니다.`)
      io.to(message.conversationId).emit('receive_message', message)
      console.log(`메시지를 ${message.conversationId} 채팅방에 보냈습니다.`)
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} 유저가 소켓 연결을 종료했습니다.`)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
