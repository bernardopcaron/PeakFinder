-- PeakFinder: buckets e políticas de arquivos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('fotos', 'fotos', true, 5 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatares', 'avatares', true, 2 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']),
  ('modelos', 'modelos', true, 50 * 1024 * 1024, array['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy peakfinder_leitura on storage.objects for select
  using (bucket_id in ('fotos', 'avatares', 'modelos'));

create policy peakfinder_envio on storage.objects for insert to authenticated
  with check (
    (bucket_id in ('fotos', 'avatares') and (storage.foldername(name))[1] = auth.uid()::text)
    or (bucket_id = 'modelos' and public.eh_admin())
  );

create policy peakfinder_substituicao on storage.objects for update to authenticated
  using (
    (bucket_id in ('fotos', 'avatares') and (storage.foldername(name))[1] = auth.uid()::text)
    or (bucket_id in ('fotos', 'avatares', 'modelos') and public.eh_admin())
  )
  with check (
    (bucket_id in ('fotos', 'avatares') and (storage.foldername(name))[1] = auth.uid()::text)
    or (bucket_id in ('fotos', 'avatares', 'modelos') and public.eh_admin())
  );

create policy peakfinder_remocao on storage.objects for delete to authenticated
  using (
    (bucket_id in ('fotos', 'avatares') and (storage.foldername(name))[1] = auth.uid()::text)
    or (bucket_id in ('fotos', 'avatares', 'modelos') and public.eh_admin())
  );
