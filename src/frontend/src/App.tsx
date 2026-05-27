import { Routes, Route } from 'react-router-dom';

import { ThemeProvider } from "@/components/theme-provider"
import EpisodePage from '@/pages/Episode.tsx';
import Home from "@/pages/Home.tsx";
import LoginPage from "@/pages/Login.tsx";
import SignupPage from '@/pages/Signup.tsx';
import FeedPage from '@/pages/Feed.tsx';


export function App() {
return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/episode" element={<EpisodePage />} />
            <Route path="/feed" element={<FeedPage />} />
        </Routes>
    </ThemeProvider>
    );
};

export default App;