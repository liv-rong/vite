import React from 'react'
import styles from './index.module.scss'

export interface IButtonProps {
  children: React.ReactNode
  variate?: 'ghost' | 'default'
}

const Button: React.FC<IButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  variate = 'default'
}) => <button className={`${styles.button} ${styles[variate]}`}>{children}</button>

export default Button
