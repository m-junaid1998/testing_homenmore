import { connection } from "next/server";
import Login from "@/screens/Login";

export default async function Page() {
  await connection(); // read GOOGLE_CLIENT_ID at request time, so no rebuild is needed when it changes
  return <Login googleClientId={process.env.GOOGLE_CLIENT_ID} />;
}
