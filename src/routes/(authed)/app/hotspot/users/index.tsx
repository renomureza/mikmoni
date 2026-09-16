import { createFileRoute } from "@tanstack/react-router";
import {
  EditIcon,
  EllipsisVerticalIcon,
  LockIcon,
  LockOpenIcon,
  PrinterIcon,
  SearchIcon,
  Trash2Icon,
  UserGroupIcon,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import {
  ensureGetHotspotUserCommentsQuery,
  ensureGetHotspotUsersQuery,
  useGetHotspotUserCommentsSuspenseQuery,
  useGetHotspotUsersSuspenseQuery,
} from "~/serverfns/hotspot-users";
import { formatBytes, formatUptime } from "~/utils/routeros";
import GenerateUserForm from "./-components/generate-user-form";
import { useDeleteHotspotUser } from "~/serverfns/hotspot-server";
import Input from "~/components/input";
import { useGetHotspotUserProfilesQuery } from "~/serverfns/hotspot-user-profiles";
import Checkbox from "~/components/checkbox";
import { cn } from "cn";
import Tooltip from "~/components/tooltip";
import ComboboxSingle from "~/components/combobox-single";

export const Route = createFileRoute("/(authed)/app/hotspot/users/")({
  validateSearch: (search: { profile?: string; comment?: string }) => search,
  loaderDeps: ({ search }) => search,
  component: RouteComponent,
  loader: async ({ context, deps }) => {
    await Promise.all([
      ensureGetHotspotUsersQuery({
        queryClient: context.queryClient,
        opts: deps,
      }),
      ensureGetHotspotUserCommentsQuery({
        queryClient: context.queryClient,
      }),
    ]);
  },
});

function UserMenu({
  user,
}: {
  user: {
    ".id": string;
    name: string;
    disabled: "true" | "false";
  };
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deleteHotspotUserMutation = useDeleteHotspotUser();

  return (
    <div className="flex items-center gap-0.5 justify-end">
      <Tooltip
        trigger={{
          className: cn(
            "rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all size-7 flex justify-center items-center",
            user.disabled === "false"
              ? "text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50"
              : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50",
          ),
          children: (
            <>
              {user.disabled === "false" ? (
                <LockOpenIcon className="size-4" />
              ) : (
                <LockIcon className="size-4" />
              )}
            </>
          ),
        }}
      >
        Disable user
      </Tooltip>
      <Dialog
        rootProps={{
          open: showUpdateModal,
          onOpenChange: setShowUpdateModal,
        }}
        title="Update User"
        triggerProps={{
          className:
            "text-neutral-600 rounded-lg transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center",
          children: <EditIcon className="size-4" />,
        }}
      >
        {/* <UpdateHotspotUserProfileForm
          onClose={() => setShowUpdateModal(false)}
          profile={profile}
        /> */}
        <div>edit user</div>
      </Dialog>
      <button
        disabled={deleteHotspotUserMutation.isPending}
        type="button"
        className="text-red-600 rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all hover:text-red-700 hover:bg-red-50 size-7 flex justify-center items-center"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteHotspotUserMutation.mutate({ data: { ".id": user[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>

      <button
        // disabled={deleteProfileMutation.isPending}
        type="button"
        className="text-neutral-600 rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center"
        // onClick={() => {
        //   if (window.confirm("Are you sure you want to delete it?")) {
        //     deleteProfileMutation.mutate({ data: { ".id": profile[".id"] } });
        //   }
        // }}
      >
        <EllipsisVerticalIcon className="size-4" />
      </button>
    </div>
  );
}

function RouteComponent() {
  const loaderDeps = Route.useLoaderDeps();
  const hotspotUsersQuery = useGetHotspotUsersSuspenseQuery(loaderDeps);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const hotpostUserProfilesQuery = useGetHotspotUserProfilesQuery();
  const hotpostUserCommentsQuery = useGetHotspotUserCommentsSuspenseQuery();
  const navigate = Route.useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return hotspotUsersQuery.data;
    return hotspotUsersQuery.data.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        (user.profile?.toLowerCase().includes(query) ?? false) ||
        (user.comment?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, hotspotUsersQuery.data]);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <div className="flex items-center gap-3">
          <Dialog
            rootProps={{
              open: showAddModal,
              onOpenChange: setShowAddModal,
            }}
            title="Create User"
            triggerProps={{
              render: (props) => (
                <Button type="button" {...props} variant="secondary">
                  <UserIcon className="size-4" /> Add
                </Button>
              ),
            }}
          >
            {/* <CreateHotspotUserProfileForm
             onClose={() => setShowCreateModal(false)}
           /> */}
            <div>dsa</div>
          </Dialog>

          <Dialog
            rootProps={{
              open: showGenerateModal,
              onOpenChange: setShowGenerateModal,
            }}
            title="Generate Users"
            triggerProps={{
              render: (props) => (
                <Button type="button" {...props}>
                  <UserGroupIcon className="size-4" /> Generate
                </Button>
              ),
            }}
          >
            <GenerateUserForm onCancel={() => setShowGenerateModal(false)} />
          </Dialog>
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full flex gap-2 justify-between">
          <div className="flex gap-2">
            <Input
              className="w-sm"
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIds([]);
              }}
            />
            <ComboboxSingle
              placeholder="Select profile..."
              className="w-50"
              options={[
                ...(hotpostUserProfilesQuery.data?.map((profile) => ({
                  label: profile.name,
                  value: profile.name,
                })) ?? []),
              ]}
              value={loaderDeps.profile ?? null}
              onChange={(profile) => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    profile: profile || undefined,
                  }),
                });
                setSelectedIds([]);
              }}
            />
            <ComboboxSingle
              placeholder="Select comment..."
              className="w-50"
              options={
                hotpostUserCommentsQuery.data?.map((comment) => ({
                  label: comment,
                  value: comment,
                })) ?? []
              }
              value={loaderDeps.comment ?? null}
              onChange={(comment) => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    comment: comment || undefined,
                  }),
                });
                setSelectedIds([]);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!selectedIds.length}
              className="h-8.5 px-3 rounded-lg border bg-blue-100 border-blue-50 text-blue-600 font-medium disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              <PrinterIcon className="size-4" /> Print
            </button>
            <button type="button" className="h-8.5 px-2">
              <EllipsisVerticalIcon className="size-4" />
            </button>
          </div>
        </div>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-left [&_thead]:bg-neutral-100 [&_th]:text-neutral-500 [&_tbody_tr:not(:last-child)]:border-b [&_thead]:border-b [&_th]:font-medium [&_th,&_td]:px-3 [&_th]:py-2 [&_td]:py-1.5">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    checked={
                      !!(
                        selectedIds.length === filteredUsers.length &&
                        filteredUsers.length
                      )
                    }
                    onCheckedChange={(checked) => {
                      const selectedIds = checked
                        ? filteredUsers.map((user) => user[".id"])
                        : [];

                      setSelectedIds(selectedIds);
                    }}
                  />
                </th>
                <th>Server</th>
                <th>Name</th>
                <th>Profile</th>
                <th>Mac Address</th>
                <th>Uptime</th>
                <th>Bytes In</th>
                <th>Bytes Out</th>
                <th>Comment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr key={user[".id"]}>
                    <td>
                      <Checkbox
                        checked={selectedIds.some((sid) => sid === user[".id"])}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) => {
                            if (checked) {
                              return prev.concat(user[".id"]);
                            }
                            return prev.filter((p) => p !== user[".id"]);
                          });
                        }}
                      />
                    </td>
                    <td>{user.server}</td>
                    <td>{user.name}</td>
                    <td>{user.profile}</td>
                    <td>{user["mac-address"]}</td>
                    <td>{formatUptime(user.uptime)}</td>
                    <td>{formatBytes(user["bytes-in"])}</td>
                    <td>{formatBytes(user["bytes-out"])}</td>
                    <td>
                      {user.comment && (
                        <button
                          type="button"
                          className="inline-flex gap-2 items-center"
                          onClick={() => {
                            navigate({
                              search: (prev) => ({
                                ...prev,
                                comment: user.comment,
                              }),
                            });
                          }}
                        >
                          <SearchIcon className="size-4" /> {user.comment}
                        </button>
                      )}
                    </td>
                    <td>
                      <UserMenu user={user} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
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
