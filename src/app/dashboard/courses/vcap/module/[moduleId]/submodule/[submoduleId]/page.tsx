import { redirect } from 'next/navigation';

export default function SubmoduleRedirect({
  params,
}: {
  params: { moduleId: string; submoduleId: string };
}) {
  redirect(`/dashboard/courses/vcap?module=${params.moduleId}&submodule=${params.submoduleId}`);
}
