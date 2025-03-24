import { auth } from "@clerk/nextjs/server";

export default async function fetchUserRole() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return role;
}

export async function fetchUserId() {
  const { userId } = await auth();
  const currentUserId = userId;
  console.log(currentUserId);
  return currentUserId;
}
