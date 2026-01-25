import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.tsx"
import LoginPage from "./pages/Login.tsx"
import SignupPage from './pages/Signup.tsx';
import { ThemeProvider } from "@/components/theme-provider"


export function App() {
return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
        </Routes>
    </ThemeProvider>
    );
}

export default App;