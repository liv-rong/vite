import React from 'react'
import styles from './index.module.scss'

export interface IButtonProps {
  children: React.ReactNode
  variate?: 'ghost' | 'default'
}

const Button: React.FC<IButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  variate = 'default',
  ...props
}) => (
  <button
    className={`${styles.button} ${styles[variate]}`}
    {...props}
  >
    {children}
  </button>
)

export default Button
