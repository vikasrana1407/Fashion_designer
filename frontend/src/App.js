import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import Studio from "@/pages/Studio";
import Gallery from "@/pages/Gallery";
import Collections from "@/pages/Collections";
import CollectionDetail from "@/pages/CollectionDetail";
import Outfits from "@/pages/Outfits";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
            <Route path="/collections/:id" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
            <Route path="/outfits" element={<ProtectedRoute><Outfits /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#121215",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 0,
                color: "#F4F4F5",
                fontFamily: "Outfit, sans-serif",
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
