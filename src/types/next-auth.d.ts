// NextAuth.js type extensions

declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
      name: string
      email: string
      image?: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    error?: string
    user: {
      id: string
      name: string
      email: string
      image?: string
    }
  }
}