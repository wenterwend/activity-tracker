import { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'
import { Toast } from './Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { toast, showToast } = useToast()
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={toast?.message} />
    </ToastContext.Provider>
  )
}

export const useShowToast = () => useContext(ToastContext)
