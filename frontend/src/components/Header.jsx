import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = ({ isActive }) =>
    `font-mono-label transition-colors ${isActive ? "text-white" : "text-white/50 hover:text-white"}`;

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-3" data-testid="logo-link">
          <span className="font-serif-display text-2xl tracking-tighter">Atelier</span>
          <span className="font-mono-label text-white/40">Noir</span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-10">
            <NavLink to="/studio" className={navLink} data-testid="nav-studio">Studio</NavLink>
            <NavLink to="/gallery" className={navLink} data-testid="nav-gallery">Gallery</NavLink>
            <NavLink to="/collections" className={navLink} data-testid="nav-collections">Mood Boards</NavLink>
            <NavLink to="/outfits" className={navLink} data-testid="nav-outfits">Outfits</NavLink>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="font-mono-label text-white/40 hidden sm:inline" data-testid="user-email">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost" data-testid="logout-btn">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-mono-label text-white/60 hover:text-white" data-testid="login-link">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary" data-testid="register-cta">
                Begin Studio
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
