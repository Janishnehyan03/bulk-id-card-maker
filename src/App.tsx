import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import TemplateHomePage from "./pages/TemplateHomePage";
import CustomersPage from "./pages/CustomersPage";
import Homepage from "./pages/Homepage";

// shadcn/ui primitives
function Navbar() {
  // Get current location for active link highlight
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/templates", label: "Templates" },
    { to: "/customers", label: "Customers" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border shadow-sm transition-colors">
      <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo or App name */}
        <div className="flex items-center gap-4">
          <Link to={"/"}>
            <span className="text-xl font-bold tracking-tight text-primary">
              ID Card Printer
            </span>
          </Link>
        </div>
        {/* Navigation */}
        <ul className="flex items-center gap-2 md:gap-6">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to !== "/" && location.pathname.startsWith(link.to));
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={
                    `relative px-3 py-2 rounded-lg text-sm font-semibold transition-colors outline-none ` +
                    (isActive
                      ? "text-primary bg-muted pointer-events-none"
                      : "text-muted-foreground hover:text-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2")
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-1/2 -bottom-[2px] -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary/80"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* For user menu/avatar, add component here */}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-[calc(100vh-60px)] flex flex-col">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/templates" element={<TemplateHomePage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
