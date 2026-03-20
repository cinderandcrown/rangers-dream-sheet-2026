import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useOptimisticMutation({
  mutationFn,
  optimisticUpdates = [],
  invalidateKeys = [],
  onError,
  onSuccess,
  ...mutationOptions
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onMutate: async (variables) => {
      const snapshots = [];

      for (const { queryKey, updater } of optimisticUpdates) {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old) => updater(old, variables));
        snapshots.push({ queryKey, previous });
      }

      return { snapshots };
    },
    onError: (error, variables, context) => {
      context?.snapshots?.forEach(({ queryKey, previous }) => {
        queryClient.setQueryData(queryKey, previous);
      });
      onError?.(error, variables, context, queryClient);
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context, queryClient);
    },
    onSettled: () => {
      invalidateKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}