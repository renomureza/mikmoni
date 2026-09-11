import { useSession as createSession } from "@tanstack/react-start/server";

type SessionUser = {
  userId: number;
};

export function getSession() {
  return createSession<SessionUser>({
    password: process.env.APP_SECRET!,
  });
}
