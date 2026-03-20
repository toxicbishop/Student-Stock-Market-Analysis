import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { UserOut, api } from './api'

interface UserContextType {
  user: UserOut | null
  groupId: string | null
  setGroupId: (id: string | null) => void
  setUser: (user: UserOut | null) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserOut | null>(null)
  const [groupId, setGroupIdState] = useState<string | null>(localStorage.getItem('tl_group_id'))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      api.users.me()
        .then(setUserState)
        .catch(() => {
          localStorage.removeItem('token')
          setUserState(null)
        })
    }
  }, [])

  const setGroupId = (id: string | null) => {
    setGroupIdState(id)
    if (id) localStorage.setItem('tl_group_id', id)
    else localStorage.removeItem('tl_group_id')
  }

  const setUser = (newUser: UserOut | null) => {
    setUserState(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUserState(null)
    setGroupId(null)
  }

  return (
    <UserContext.Provider value={{ user, groupId, setGroupId, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
