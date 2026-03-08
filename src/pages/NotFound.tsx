import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.warn(`Route not found: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>

        <p className="text-lg text-muted-foreground">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="text-primary underline hover:opacity-80"
        >
          Go back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;