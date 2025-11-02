import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService, LoginRequest, SignupRequest, User } from '@/services/auth.service'
import { useAuthStore } from '@/store/useAuthStore'
import { AxiosError } from 'axios'

interface ErrorResponse {
  message: string
  statusCode?: number
  error?: string
}

export const useLogin = () => {
  const navigate = useNavigate()
  const { login: storeLogin } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      storeLogin(response.user, response.access_token)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate('/home')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error('Login error:', error.response?.data?.message || 'Login failed')
    },
  })
}

export const useSignup = () => {
  const navigate = useNavigate()
  const { login: storeLogin } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (response) => {
      storeLogin(response.user, response.access_token)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      navigate('/home')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error('Signup error:', error.response?.data?.message || 'Signup failed')
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { logout: storeLogout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error('Logout error:', error.response?.data?.message || 'Logout failed')
      // Even if the logout API fails, clear local state
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })
}

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      console.log('Password reset email sent')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error(
        'Forgot password error:',
        error.response?.data?.message || 'Failed to send reset email'
      )
    },
  })
}

export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      navigate('/login')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error(
        'Reset password error:',
        error.response?.data?.message || 'Failed to reset password'
      )
    },
  })
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      console.log('Email verified successfully')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error(
        'Email verification error:',
        error.response?.data?.message || 'Failed to verify email'
      )
    },
  })
}
