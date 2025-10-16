import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { client } from "./sanity/lib/client"
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries"
import { writeClient } from "./sanity/lib/write-client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user: { name, email, image }, profile: { id, login, bio } }) {
      // ✅ Check if user exists in Sanity
      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id })

      if (!existingUser) {
        // ✅ Create new user in Sanity
        await writeClient.create({
          _type: "author",
          githubId: id,
          name,
          username: login,
          email,
          image,
          bio: bio || "",
        })
      }

      return true
    },

    async jwt({ token, account, profile }) {
      // ✅ Runs on first login
      if (account && profile) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: profile.id })

        // ✅ Attach IDs to token
        token.githubId = profile.id
        token.id = user?._id || profile.id
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // ✅ Make sure ID always exists
        session.user.id = token.id || token.githubId || null
        session.user.githubId = token.githubId || null
      }
      return session
    },
  },
})
