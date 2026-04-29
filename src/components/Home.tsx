export function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Your feed is empty
          </h1>
          <p className="text-neutral-600 text-sm">
            Subscribe to a channel, or create one of your own.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
          <button
            type="button"
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Subscribe to a channel
          </button>
          <button
            type="button"
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium rounded-lg transition-colors"
          >
            Create a channel
          </button>
        </div>
      </div>
    </div>
  )
}
