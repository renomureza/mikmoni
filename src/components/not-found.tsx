import { Trans } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import Button from "./button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NotFound({ children }: { children?: any }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="flex flex-col">
        <span className="text-6xl font-semibold sm:text-7xl">404</span>
        <span className="text-xl font-medium">
          <Trans>Page Not Found</Trans>
        </span>
      </h1>
      <div className="mt-2 text-neutral-600">
        {children || (
          <p className="text-base">
            <Trans>The page you are looking for does not exist.</Trans>
          </p>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <Trans>Back</Trans>
        </Button>
        <Button
          render={(props) => (
            <Link {...props} to="/">
              <Trans>Start over</Trans>
            </Link>
          )}
        />
      </div>
    </div>
  );
}
