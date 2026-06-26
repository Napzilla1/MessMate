import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, User, Shield } from 'lucide-react'
import { io } from 'socket.io-client'
import api from '../api'
import { useAuth } from '../App'

export default function LiveChat() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [socket, setSocket] = useState(null)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef(null)

  // Only render for authenticated users with a hostel
  if (!user || !user.hostel) return null;

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    // Join room for this hostel
    newSocket.emit('join_hostel_room', user.hostel)

    // Fetch history
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${user.hostel}`)
        setMessages(res.data)
      } catch (err) {
        console.error('Failed to fetch chat history', err)
      }
    }
    fetchHistory()

    // Listen for incoming messages
    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg])
      if (!isOpen) {
        setUnread(u => u + 1)
      }
    })

    return () => newSocket.disconnect()
  }, [user.hostel])

  // Mark read when opened
  useEffect(() => {
    if (isOpen) setUnread(0)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !socket) return
    
    socket.emit('send_message', {
      hostel: user.hostel,
      senderId: user.id || user._id,
      senderName: user.name,
      senderRole: user.role,
      text: input
    })
    
    setInput('')
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-teal-dark))',
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(20,184,166,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          className="hover-scale"
        >
          <MessageSquare size={24} />
          {unread > 0 && (
            <div style={{
              position: 'absolute', top: -5, right: -5,
              background: 'var(--accent-rose)', color: '#fff',
              fontSize: '0.75rem', fontWeight: 800,
              width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              {unread}
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 350, height: 500, borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem' }}>Hostel Chat</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.hostel}</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'auto', marginBottom: 'auto' }}>
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender === (user.id || user._id)
                const isManager = msg.senderRole === 'manager' || msg.senderRole === 'admin'
                return (
                  <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                      {!isMe && isManager && <Shield size={10} color="var(--accent-amber)" />}
                      {msg.senderName}
                    </div>
                    <div style={{
                      padding: '10px 14px', borderRadius: 16,
                      background: isMe ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      borderBottomRightRadius: isMe ? 4 : 16,
                      borderBottomLeftRadius: !isMe ? 4 : 16,
                      fontSize: '0.9rem', maxWidth: '85%',
                      boxShadow: isMe ? '0 4px 10px rgba(20,184,166,0.2)' : 'none'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 999,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                  color: '#fff', fontSize: '0.9rem'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: input.trim() ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)',
                  color: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
              >
                <Send size={16} style={{ marginLeft: 2 }} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
