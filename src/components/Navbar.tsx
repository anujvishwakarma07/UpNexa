// src/app/components/Navbar.tsx
import { auth, signIn, signOut } from "@/auth"

import { BadgePlus, LogOut } from "lucide-react";
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="px-4 py-3 shadow-sm bg-white">
      <nav className="flex justify-between items-center ">
        <Link href="/">
          <Image src="/upnexa.png" alt="Logo" width={144} height={40} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          {session && session.user ? (
            <>
              <Link href="/startup/create" className="flex items-center gap-2">
                <span className="max-sm:hidden">Create</span>
                <BadgePlus className="w-5 h-5 text-black" />
              </Link>

              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button type="submit" className="flex items-center gap-2 text-red-500">
                  <span className="max-sm:hidden">Logout</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </form>

              <Link href={`/user/${session.user.id}`}>
                <Avatar className="size-10">
                  <AvatarImage 
                  src={session?.user?.image || ""} 
                  alt={session?.user?.name || ""} 
                />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
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
