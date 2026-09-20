import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Button from "~/components/button";
import Input from "~/components/input";
import Select from "~/components/select";
import {
  ensureGetUserLogsQuery,
  useGetUserLogsSuspenseQuery,
} from "~/serverfns/user-log";

export const Route = createFileRoute("/(authed)/app/log/user")({
  validateSearch: (search: { day?: number; month?: number; year?: number }) =>
    search,
  loaderDeps: (d) => d.search,
  component: RouteComponent,
  loader: async ({ context, deps }) => {
    await ensureGetUserLogsQuery({
      queryClient: context.queryClient,
      opts: deps,
    });
  },
});

const dayOptions = Array.from({ length: 31 }, (_, i) => {
  const value = i + 1;
  const label = String(value);
  return { label: label, value: value };
});

const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(0, i).toLocaleString("en", { month: "long" });
  return { label: month, value: i + 1 };
});

const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: year };
});

function DateFilter({
  value,
  onSubmit,
}: {
  value?: {
    day?: number;
    month?: number;
    year?: number;
  };
  onSubmit: (value?: { day?: number; month?: number; year?: number }) => void;
}) {
  const [filter, setFilter] = useState<{
    day: number | null;
    month: number | null;
    year: number | null;
  }>({
    day: value?.day || null,
    month: value?.month || null,
    year: value?.year || null,
  });

  useEffect(() => {
    setFilter({
      day: value?.day || null,
      month: value?.month || null,
      year: value?.year || null,
    });
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          day: filter.day || undefined,
          month: filter.month || undefined,
          year: filter.year || undefined,
        });
      }}
      className="flex gap-2 items-center"
    >
      <Select
        className="w-32"
        options={[{ label: "Select day", value: null }, ...dayOptions]}
        value={filter.day}
        onChange={(day) => {
          setFilter((prev) => ({ ...prev, day }));
        }}
      />
      <Select
        className="w-34"
        options={[{ label: "Select month", value: null }, ...monthOptions]}
        value={filter.month}
        onChange={(month) => {
          setFilter((prev) => ({ ...prev, month }));
        }}
      />
      <Select
        className="w-34"
        options={[{ label: "Select year", value: null }, ...yearOptions]}
        value={filter.year}
        onChange={(year) => {
          setFilter((prev) => ({ ...prev, year }));
        }}
      />
      <Button
        type="submit"
        disabled={
          (!!filter.month && !filter.year) ||
          (!filter.month && !!filter.year) ||
          (!!filter.day && !filter.month && !filter.year)
        }
      >
        Filter
      </Button>
      {(value?.day || value?.month || value?.year) && (
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            onSubmit(undefined);
          }}
        >
          Clear
        </Button>
      )}
    </form>
  );
}

function RouteComponent() {
  const deps = Route.useLoaderDeps();
  const userLogsQuery = useGetUserLogsSuspenseQuery(deps);
  const navigate = Route.useNavigate();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">User Log</h1>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Search..." className="max-w-70 w-full" />
          <div className="h-8 mx-1 w-px bg-neutral-200"></div>
          <DateFilter
            value={deps}
            onSubmit={(search) => {
              navigate({
                search: search,
              });
            }}
          />
        </div>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-left [&_thead]:bg-neutral-100 [&_th]:text-neutral-500 [&_tbody_tr:not(:last-child)]:border-b [&_thead]:border-b [&_th]:font-medium [&_th,&_td]:px-3 [&_th]:py-2 [&_td]:py-1.5">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>User</th>
                <th>Address</th>
                <th>Mac Address</th>
                <th>Validity</th>
              </tr>
            </thead>
            <tbody>
              {userLogsQuery.data?.length ? (
                userLogsQuery.data.map((userLog) => (
                  <tr key={userLog[".id"]}>
                    <td>{userLog.date}</td>
                    <td>{userLog.time}</td>
                    <td>{userLog.user}</td>
                    <td>{userLog.address}</td>
                    <td>{userLog.macAddress}</td>
                    <td>{userLog.validity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex justify-center items-center min-h-60">
                      <div>No Results Found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
