import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (
                    credentials?.email === 'mpm@careinsight.com' &&
                    credentials?.password === 'password123'
                ) {
                    return { id: '1', name: 'Maheen  Peermohamed', email: 'mpm@careinsight.com' };
                }
                if (
                    credentials?.email === 'test@careinsight.com' &&
                    credentials?.password === 'password123'
                ) {
                    return { id: '2', name: 'test user', email: 'test@careinsight.com' };
                }
                return null;
            },
        }),
    ],
    pages: { signIn: '/login' },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };