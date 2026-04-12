import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/browse">
              <Search className="mr-2 h-4 w-4" />
              Browse Patents
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Looking for something specific?</p>
          <div className="flex gap-4 justify-center mt-2">
            <Link to="/browse" className="text-blue-600 hover:underline">
              Browse Patents
            </Link>
            <Link to="/ai-chatbot" className="text-blue-600 hover:underline">
              AI Assistant
            </Link>
            <Link to="/about" className="text-blue-600 hover:underline">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
