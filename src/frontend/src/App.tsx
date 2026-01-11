import { Routes, Route } from 'react-router-dom';
import Home from "./pages/home.tsx"
import { ThemeProvider } from "@/components/theme-provider"


export function App() {
return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    </ThemeProvider>
    );
}

export default App;