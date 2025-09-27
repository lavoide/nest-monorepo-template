import { api } from '@/lib/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    username: string
    role: string
  }
  token: string
  refreshToken?: string
}

export interface User {
  id: string
  email: string
  username: string
  role: string
}

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  }
}

export const authService = new AuthService()