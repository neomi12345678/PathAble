-- Grant sync lock RPC to service role (admin client)
grant execute on function public.acquire_job_sync_lock(int) to service_role;
