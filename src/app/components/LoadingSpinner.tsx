export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-purple-400/20 border-4"></div>
        </div>
        <p className="mt-6 text-white/80 text-lg">Loading...</p>
      </div>
    </div>
  );
}

export function SmallLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
    </div>
  );
}

export function InlineLoadingSpinner() {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
  );
}
