import NextAuth from 'next-auth';
import GoogleProvider  from 'next-auth/providers/google';
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { firebaseConfig } from "firebase.config.js"

interface OauthClient {
  clientId: string,
  clientSecret: string
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } as OauthClient)
  ],
  adapter: FirestoreAdapter(firebaseConfig),
};

export default NextAuth(authOptions);