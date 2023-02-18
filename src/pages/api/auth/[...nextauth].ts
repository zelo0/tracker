import NextAuth from 'next-auth';
import GoogleProvider  from 'next-auth/providers/google';
import { FirestoreAdapter, initFirestore } from "@next-auth/firebase-adapter"
import { cert } from "firebase-admin/app"

interface OauthClient {
  clientId: string,
  clientSecret: string
}

/* initFirestore: no duplicate app initialization issues in serverless environments */
const firestore = initFirestore(({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  })
}));

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } as OauthClient)
  ],
  adapter: FirestoreAdapter(firestore),
};

export default NextAuth(authOptions);