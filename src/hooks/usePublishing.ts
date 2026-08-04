import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishingApi, Post } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

export function usePublishing(params?: Record<string, any>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const postsQuery = useQuery({
    queryKey: ['publishing-posts', params],
    queryFn: () => publishingApi.getPosts(params),
  });

  const jobsQuery = useQuery({
    queryKey: ['publishing-jobs'],
    queryFn: () => publishingApi.getJobs(),
  });

  const createPostMutation = useMutation({
    mutationFn: (newPost: Partial<Post>) => publishingApi.createPost(newPost),
    onSuccess: () => {
      toast({ title: 'Post Created', description: 'Your post has been successfully saved/scheduled.' });
      queryClient.invalidateQueries({ queryKey: ['publishing-posts'] });
      queryClient.invalidateQueries({ queryKey: ['publishing-jobs'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to Create Post',
        description: err.response?.data?.detail || err.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, post }: { id: number; post: Partial<Post> }) => publishingApi.updatePost(id, post),
    onSuccess: () => {
      toast({ title: 'Post Updated', description: 'Post changes saved.' });
      queryClient.invalidateQueries({ queryKey: ['publishing-posts'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.detail || err.message || 'Failed to update post.',
        variant: 'destructive',
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => publishingApi.deletePost(id),
    onSuccess: () => {
      toast({ title: 'Post Deleted', description: 'The post was removed.' });
      queryClient.invalidateQueries({ queryKey: ['publishing-posts'] });
    },
  });

  const retryJobMutation = useMutation({
    mutationFn: (jobId: number) => publishingApi.retryJob(jobId),
    onSuccess: () => {
      toast({ title: 'Retry Triggered', description: 'Publishing job queued for retry.' });
      queryClient.invalidateQueries({ queryKey: ['publishing-jobs'] });
    },
  });

  return {
    posts: postsQuery.data || [],
    isLoadingPosts: postsQuery.isLoading,
    jobs: jobsQuery.data || [],
    isLoadingJobs: jobsQuery.isLoading,
    createPost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    retryJob: retryJobMutation.mutateAsync,
    refetchPosts: postsQuery.refetch,
  };
}
