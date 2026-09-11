import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import {
  createRouteros,
  CreateRouterosInput,
  deleteRouteros,
  DeleteRouterosInputSchema,
  getAllRouteros,
  getRouteros,
  GetRouterosInputSchema,
  updateRouteros,
  UpdateRouterosInputSchema,
} from "./service";
import { toast } from "sonner";

const $createRouteros = createServerFn({ method: "POST" })
  .validator((d: CreateRouterosInput) => d)
  .handler(({ data }) => createRouteros(data));

export function useCreateRouterosMutation() {
  const mutate = useServerFn($createRouteros);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
      }
    },
  });
}

const $updateRouteros = createServerFn({ method: "POST" })
  .validator((d: UpdateRouterosInputSchema) => d)
  .handler(({ data }) => updateRouteros(data));

export function useUpdateRouterosMutation() {
  const mutate = useServerFn($updateRouteros);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
      } else if (data.error) {
        toast.error(data.error);
      }
    },
  });
}

const $deleteRouteros = createServerFn({ method: "POST" })
  .validator((d: DeleteRouterosInputSchema) => d)
  .handler(({ data }) => deleteRouteros(data));

export function useDeleteRouterosMutation() {
  const mutate = useServerFn($deleteRouteros);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
      } else if (data.error) {
        toast.error(data.error);
      }
    },
  });
}

const $getAllRouteros = createServerFn().handler(getAllRouteros);

export function useGetAllRouterosQuery() {
  const query = useServerFn($getAllRouteros);
  return useQuery({
    queryFn: query,
    queryKey: ["routeros"],
  });
}

export const $getRouteros = createServerFn()
  .validator((d: GetRouterosInputSchema) => d)
  .handler(({ data }) => getRouteros(data));
