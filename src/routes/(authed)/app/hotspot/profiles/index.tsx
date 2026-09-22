import { createFileRoute } from "@tanstack/react-router";
import {
  EditIcon,
  LockIcon,
  LockOpenIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import {
  ensureGetHotspotUserProfilesQueryData,
  useDeleteHotspotUserProfile,
  useGetHotspotUserProfilesSuspenseQuery,
} from "~/serverfns/hotspot-user-profiles";
import CreateHotspotUserProfileForm from "./-components/create-hotspot-user-profile-form";
import { useState } from "react";
import UpdateHotspotUserProfileForm from "./-components/update-hotspot-user-profile-form";
import {
  ExpiredModeValue,
  getExpiredModeLabel,
} from "~/contants/hotspot-profile";

export const Route = createFileRoute("/(authed)/app/hotspot/profiles/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotUserProfilesQueryData({
      queryClient: context.queryClient,
    });
  },
});

function UserProfileMenu({
  profile,
}: {
  profile: {
    expiredMode: ExpiredModeValue;
    price: string;
    sellingPrice: string;
    validity: string;
    lockUsers: boolean;
    ".id": string;
    name: string;
    "shared-users": string;
    "rate-limit"?: string;
    "parent-queue"?: string;
    "address-pool"?: string;
  };
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deleteProfileMutation = useDeleteHotspotUserProfile();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog
        rootProps={{
          open: showUpdateModal,
          onOpenChange: setShowUpdateModal,
        }}
        title="Update Profile"
        triggerProps={{
          className:
            "text-neutral-600 rounded-lg transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center",
          children: <EditIcon className="size-4" />,
        }}
      >
        <UpdateHotspotUserProfileForm
          onClose={() => setShowUpdateModal(false)}
          profile={profile}
        />
      </Dialog>
      <button
        disabled={deleteProfileMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteProfileMutation.mutate({ data: { ".id": profile[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function RouteComponent() {
  const hotspotUserProfilesQuery = useGetHotspotUserProfilesSuspenseQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">User Profiles</h1>
        <Dialog
          rootProps={{
            open: showCreateModal,
            onOpenChange: setShowCreateModal,
          }}
          title="Create Profile"
          triggerProps={{
            render: (props) => (
              <Button type="button" {...props}>
                <PlusIcon className="size-4" /> Profile
              </Button>
            ),
          }}
        >
          <CreateHotspotUserProfileForm
            onClose={() => setShowCreateModal(false)}
          />
        </Dialog>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-1.5 [&_th]:py-2 [&_th]:font-medium [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead]:border-b [&_thead]:bg-neutral-100">
          <thead>
            <tr>
              <th>Name</th>
              <th>Shared Users</th>
              <th>Rate Limit</th>
              <th>Expired Mode</th>
              <th>Validity</th>
              <th>Price</th>
              <th>Selling Price</th>
              <th>Lock User</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotspotUserProfilesQuery.data.map((profile) => (
              <tr key={profile[".id"]}>
                <td>{profile.name}</td>
                <td>{profile["shared-users"]}</td>
                <td>{profile["rate-limit"]}</td>
                <td>{getExpiredModeLabel(profile.expiredMode)}</td>
                <td>{profile.validity}</td>
                <td>{profile.price}</td>
                <td>{profile.sellingPrice}</td>
                <td>
                  {profile.lockUsers ? (
                    <LockIcon className="size-4 text-green-600" />
                  ) : (
                    <LockOpenIcon className="size-4 text-neutral-500" />
                  )}
                </td>
                <td>
                  <UserProfileMenu profile={profile} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
