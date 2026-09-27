import { Trans } from "@lingui/react/macro";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import Button from "./button";

export default function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useLocation({
    select: (location) => location.pathname === "/",
  });

  console.error(error);

  const typedError = error as { message?: string } | null;

  return (
    <div className="flex min-h-full min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-center text-2xl font-semibold">
        <Trans>Something Went Wrong</Trans>
      </h1>
      {typedError?.message ? (
        <pre className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-left text-xs text-red-700">
          <code>{typedError.message}</code>
        </pre>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => {
            void router.invalidate();
          }}
        >
          <Trans>Try Again</Trans>
        </Button>
        {isRoot ? (
          <Button
            render={(props) => (
              <Link {...props} to="/">
                <Trans>Home</Trans>
              </Link>
            )}
          />
        ) : (
          <Button
            render={(props) => (
              <Link
                {...props}
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              >
                <Trans>Back</Trans>
              </Link>
            )}
          />
        )}
      </div>
    </div>
  );
}
