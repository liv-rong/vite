import React from 'react'
import styles from './index.module.scss'

export interface IInputProps {
  children: React.ReactNode
}

const Input: React.FC<IInputProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children
}) => <div className={`${styles.button}}`}>{children}</div>

export default Input
