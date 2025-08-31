export interface AuthDto {
  email: string
  password: string
}

export interface SocialAuthDto {
  token: string
}

export interface RegisterDto {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export interface PasswordDto {
  password: string
  newPassword: string
}