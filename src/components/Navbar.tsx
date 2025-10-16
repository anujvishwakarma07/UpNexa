// src/app/components/Navbar.tsx
import { auth, signIn, signOut } from "@/auth"
import Image from "next/image"
import Link from "next/link"

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="px-4 py-3 shadow-sm bg-white">
      <nav className="flex justify-between items-center ">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={144} height={40} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          {session && session.user ? (
            <>
              <Link href="/startup/create">Create</Link>

              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button type="submit">Logout</button>
              </form>

              <Link href={`/user/${session.user.id}`}>
                {session.user.name}
              </Link>
            </>
          ) : (
            <form
              action={async () => {
                "use server"
                await signIn("github", { redirectTo: "/" })
              }}
            >
              <button type="submit">Login</button>
            </form>
          )}
        </div>
      </nav>
    </header>
  )
}
