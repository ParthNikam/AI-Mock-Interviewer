import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Authentication Error</h1>
      <p className="text-muted-foreground text-center max-w-md">
        We couldn&apos;t complete sign in. The link may have expired or been used
        already.
      </p>
      <Link
        href="/"
        className="text-primary hover:underline font-medium"
      >
        Return home
      </Link>
    </div>
  )
}
