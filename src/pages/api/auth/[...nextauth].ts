import NextAuth from 'next-auth';
import GithubProvider  from 'next-auth/providers/github';
import GoogleProvider  from 'next-auth/providers/google';
import { firebaseConfig } from 'firebase.config';
import { FirestoreAdapter } from "@next-auth/firebase-adapter"

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
  adapter: FirestoreAdapter(firebaseConfig)
};

export default NextAuth(authOptions);