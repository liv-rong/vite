// src/components/Button.tsx
import React from 'react'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
}

const MyButton = ({ children, onClick }: ButtonProps) => {
  return (
    <button
      style={{ backgroundColor: 'blue' }}
      onClick={onClick}
    >
      button {children}
    </button>
  )
}

export default MyButton
