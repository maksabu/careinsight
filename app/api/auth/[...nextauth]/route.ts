import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/lib/db';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const workers = await query(
                    'SELECT * FROM workers WHERE email = $1 AND active = true',
                    [credentials?.email]
                );
                if (workers.length === 0) return null;
                const worker = workers[0];
              

                if (credentials?.password !== worker.password) return null;
                return {
                    id: String(worker.id),
                    name: worker.name,
                    email: worker.email,
                    role: worker.role,
                };
            },
        }),
    ],
    pages: { signIn: '/login' },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
            return session;
        },
    },
});

export { handler as GET, handler as POST };