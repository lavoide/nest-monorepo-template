export interface AuthDto {
  email: string;
  password: string;
}

export interface SocialAuthDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface SocialRegisterDto {
  name: string;
  email: string;
}