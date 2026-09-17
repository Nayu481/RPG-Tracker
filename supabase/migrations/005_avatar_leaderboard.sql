-- 005 avatar + leaderboard
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do update set public = true;

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars" on storage.objects for select to public using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.get_leaderboard(limit_count integer default 20)
returns table (user_id uuid, username text, avatar text, level integer, xp integer, completed_tasks integer, completed_objectives integer, best_streak integer)
language sql security definer set search_path = '' as $$
  select id, username, avatar, level, xp, completed_tasks, completed_objectives, best_streak
  from public.profiles
  order by level desc, xp desc, completed_tasks desc
  limit greatest(1, least(coalesce(limit_count, 20), 100));
$$;

revoke all on function public.get_leaderboard(integer) from public, anon;
grant execute on function public.get_leaderboard(integer) to authenticated;
