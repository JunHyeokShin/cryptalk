'use client'

import { createContext, useContext } from 'react'
import { io } from 'socket.io-client'

const socket = io()

const SocketContext = createContext(socket)

export function useSocket() {
  return useContext(SocketContext)
}
