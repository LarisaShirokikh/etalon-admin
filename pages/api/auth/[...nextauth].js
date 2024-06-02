import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import YandexProvider from "next-auth/providers/yandex";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

const adminEmails = ["prazdnikdvora@gmail.com"];
//const adminEmails = ["Lorashirokikh@yandex.ru"];

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // YandexProvider({
    //   clientId: process.env.YANDEX_CLIENT_ID,
    //   clientSecret: process.env.YANDEX_CLIENT_SECRET,
    // }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({ session, token, user }) => {
      if (adminEmails.includes(session?.user?.email)) {
        return session;
      } else {
        return false;
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!adminEmails.includes(session?.user?.email)) {
    res.status(401);
    res.end();
    throw "not an admin";
  }
}
