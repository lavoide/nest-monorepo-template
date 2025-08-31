export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export enum Role {
  User = 'USER',
  Admin = 'ADMIN'
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