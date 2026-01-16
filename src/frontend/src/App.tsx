import { Routes, Route } from 'react-router-dom';
import Home from "./pages/home.tsx"
import LoginPage from "./pages/log-in.tsx"
import SignupPage from './pages/sign-up.tsx';
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