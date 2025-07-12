import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@/app/generated/prisma"
import { nextCookies } from "better-auth/next-js"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
  },
  logger: {
    disabled: false,
  },
   plugins: [nextCookies()] 
})

export type Session = typeof auth.$Infer.Session