import { useLogoutMutation } from "~/serverfns/auth";
import Popover from "./popover";
import { Link } from "@tanstack/react-router";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { Trans } from "@lingui/react/macro";

function ProfilePopoverContent({
  user,
  closePopover,
}: {
  user: User;
  closePopover: () => void;
}) {
  const logoutMutation = useLogoutMutation();

  return (
    <>
      <div className="flex items-center gap-2 border-b px-2 py-2.5 text-left">
        <img
          src={`https://avatar.vercel.sh/${user.username}?size=30`}
          className="size-8 shrink-0 rounded-full"
        />
        <div className="grow">
          <div className="leading-tight font-medium">{user.name}</div>
          <div className="text-xs leading-tight text-neutral-600">
            {user.username}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-px pb-1">
        <Link
          to="/account"
          className="flex h-8.5 w-full items-center gap-2 rounded-lg px-3 text-neutral-700 transition-all hover:bg-neutral-100 hover:text-foreground"
          onClick={closePopover}
        >
          <div className="grow">
            <Trans>Account</Trans>
          </div>
          <SettingsIcon className="size-4 shrink-0" />
        </Link>
        <button
          disabled={logoutMutation.isPending}
          className="flex h-8.5 w-full items-center gap-2 rounded-lg px-3 text-left text-neutral-700 transition-all hover:bg-neutral-100 hover:text-foreground"
          type="button"
          onClick={() => {
            logoutMutation.mutate();
          }}
        >
          <div className="grow">
            <Trans>Logout</Trans>
          </div>
          <LogOutIcon className="size-4 shrink-0" />
        </button>
      </div>
    </>
  );
}

type User = {
  name: string;
  username: string;
};

export default function ProfilePopover({ user }: { user: User }) {
  const [open, onOpenChange] = useState(false);
  return (
    <Popover
      root={{ open, onOpenChange }}
      popoverTrigger={{
        className: "size-7.5 shrink-0 rounded-full overflow-hidden",
        children: (
          <img
            src={`https://avatar.vercel.sh/${user.username}?size=30`}
            className="size-full"
          />
        ),
      }}
      popupClassName="flex flex-col gap-1 min-w-52"
    >
      <ProfilePopoverContent
        closePopover={() => onOpenChange(false)}
        user={user}
      />
    </Popover>
  );
}
