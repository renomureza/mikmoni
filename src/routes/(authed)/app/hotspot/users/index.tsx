import { createFileRoute } from "@tanstack/react-router";
import {
  CheckIcon,
  EditIcon,
  EllipsisVerticalIcon,
  Trash2Icon,
  UserGroupIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import {
  ensureGetHotspotUsersQueryData,
  useGetHotspotUsersSuspenseQuery,
} from "~/serverfns/hotspot-users";
import { formatBytes, formatUptime } from "~/utils/routeros";

export const Route = createFileRoute("/(authed)/app/hotspot/users/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotUsersQueryData({ queryClient: context.queryClient });
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
  // const deleteProfileMutation = useDeleteHotspotUserProfile();

  return (
    <div className="flex items-center gap-0.5 justify-end">
      <button
        // disabled={deleteProfileMutation.isPending}
        type="button"
        className="text-green-600 rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all hover:text-green-700 hover:bg-green-50 size-7 flex justify-center items-center"
        // onClick={() => {
        //   if (window.confirm("Are you sure you want to delete it?")) {
        //     deleteProfileMutation.mutate({ data: { ".id": profile[".id"] } });
        //   }
        // }}
      >
        <CheckIcon className="size-4" />
      </button>
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
        // disabled={deleteProfileMutation.isPending}
        type="button"
        className="text-red-600 rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all hover:text-red-700 hover:bg-red-50 size-7 flex justify-center items-center"
        // onClick={() => {
        //   if (window.confirm("Are you sure you want to delete it?")) {
        //     deleteProfileMutation.mutate({ data: { ".id": profile[".id"] } });
        //   }
        // }}
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
  const hotspotUsersQuery = useGetHotspotUsersSuspenseQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  console.log(hotspotUsersQuery.data);

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
              open: showCreateModal,
              onOpenChange: setShowCreateModal,
            }}
            title="Create Profile"
            triggerProps={{
              render: (props) => (
                <Button type="button" {...props}>
                  <UserGroupIcon className="size-4" /> Generate
                </Button>
              ),
            }}
          >
            {/* <CreateHotspotUserProfileForm
             onClose={() => setShowCreateModal(false)}
           /> */}
            <div>dsa</div>
          </Dialog>
        </div>
      </div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left [&_thead]:bg-neutral-100 [&_th]:text-neutral-500 [&_tbody_tr:not(:last-child)]:border-b [&_thead]:border-b [&_th]:font-medium [&_th,&_td]:px-3 [&_th]:py-2 [&_td]:py-1.5">
          <thead>
            <tr>
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
            {hotspotUsersQuery.data.map((user) => (
              <tr key={user[".id"]}>
                <td>{user.server}</td>
                <td>{user.name}</td>
                <td>{user.profile}</td>
                <td>{user["mac-address"]}</td>
                <td>{formatUptime(user.uptime)}</td>
                <td>{formatBytes(user["bytes-in"])}</td>
                <td>{formatBytes(user["bytes-out"])}</td>
                <td>{user.comment}</td>
                <td>
                  <UserMenu user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
