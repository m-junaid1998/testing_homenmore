import { connection } from "next/server";
import Signup from "@/screens/Signup";

export default async function Page() {
  await connection(); // read GOOGLE_CLIENT_ID at request time, so no rebuild is needed when it changes
  return <Signup googleClientId={process.env.GOOGLE_CLIENT_ID} />;
}
