import logo from "@/assets/logo.png";
import { LoginForm } from "@/components/login-form";


export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="text-primary-foreground flex size-15 items-center justify-center rounded-md">
            <img src={logo} className="h-auto w-auto"/>
          </div>
          ReYapp
        </a>
        <LoginForm />
      </div>
    </div>
  )
};
