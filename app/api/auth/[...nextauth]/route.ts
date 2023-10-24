import nextAut, { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                usertelf: { label: "Telefono", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = { id: "1", name: "j Smith", password: "1234" }
                if (user) {
                    return user;
                } else {
                    return null;
                }
            }
        })
    ]
}


const handler = NextAuth(authOptions)


export { handler as GET, handler as POST }