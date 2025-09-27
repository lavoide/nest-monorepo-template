import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"

const Signup = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <SignupForm />
    </div>
  )
}

export default Signup