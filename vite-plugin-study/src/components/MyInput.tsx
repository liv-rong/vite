// src/components/Button.tsx
import React from 'react'

interface ButtonProps {
  children?: React.ReactNode
}

const MyInput = ({ children }: ButtonProps) => {
  return <div>MyInput {children}</div>
}

export default MyInput
