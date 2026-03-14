import React, { createContext, useContext, useState, ReactNode } from 'react'

interface UserContextType {
  userId: string
  userName: string
  groupId: string | null
  setGroupId: (id: string | null) => void
  setUser: (id: string, name: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState('demo-user-1')
  const [userName, setUserName] = useState('Pranav')
  const [groupId, setGroupIdState] = useState<string | null>(localStorage.getItem('tl_group_id'))

  const setGroupId = (id: string | null) => {
    setGroupIdState(id)
    if (id) localStorage.setItem('tl_group_id', id)
    else localStorage.removeItem('tl_group_id')
  }

  const setUser = (id: string, name: string) => {
    setUserId(id)
    setUserName(name)
  }

  return (
    <UserContext.Provider value={{ userId, userName, groupId, setGroupId, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
