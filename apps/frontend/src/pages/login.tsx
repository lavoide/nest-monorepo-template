import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

const Login = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  )
}

export default Login