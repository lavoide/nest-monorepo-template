import { api } from '@/lib/api'
import { AuthDto, Role } from '@monorepo/shared'

export type LoginRequest = AuthDto;

export interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: Role | string
  gender?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string
  user: User
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return response.data.data
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
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