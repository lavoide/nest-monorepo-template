export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface CreateUserDto {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export interface UpdateUserDto {
  email?: string
  username?: string
  firstName?: string
  lastName?: string
}