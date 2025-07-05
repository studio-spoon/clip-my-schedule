import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      // 全てのGoogleアカウントでログイン可能
      return true
    },
    async jwt({ token, account, user }: { token: any; account: any; user: any }) {
      // 初回ログイン時にaccess_tokenを保存
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      if (user) {
        token.user = {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          image: user.image,
        }
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      // セッションにaccess_tokenとユーザー情報を含める
      session.accessToken = token.accessToken as string
      session.user = token.user
      return session
    },
  },
  pages: {
    signIn: "/", // カスタムログインページを使用
    error: "/", // エラー時もメインページにリダイレクト
  },
  session: {
    strategy: "jwt" as const,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }