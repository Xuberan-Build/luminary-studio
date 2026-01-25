import { redirect } from 'next/navigation';

export default function ModuleRedirect({
  params,
}: {
  params: { moduleId: string };
}) {
  redirect(`/dashboard/courses/vcap?module=${params.moduleId}`);
}
