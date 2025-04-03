import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// Extend the session and JWT types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Please enter both email and password");
        }

        try {
          console.log("🔍 Looking up user:", credentials.email);
          console.log("Database connection check: Attempting to connect to database...");
          
          // Try a simple database operation to verify connection
          try {
            const dbTest = await prisma.$queryRaw`SELECT 1 as connected`;
            console.log("Database connection test result:", dbTest);
          } catch (dbError) {
            console.error("❌ Database connection error:", dbError);
            throw new Error("Database connection error");
          }
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              image: true,
            },
          });

          if (!user) {
            console.log("❌ User not found:", credentials.email);
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            console.log("❌ User has no password set:", credentials.email);
            throw new Error("Invalid email or password");
          }

          console.log("🔐 Verifying password...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Invalid password for user:", credentials.email);
            throw new Error("Invalid email or password");
          }

          console.log("✅ Authentication successful for user:", credentials.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Error during authentication:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    signOut: "/",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  debug: true, // Enable debug mode for all environments to help troubleshoot
}; 