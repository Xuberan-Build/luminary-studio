import { redirect } from 'next/navigation';

export default async function PersonalAlignmentInteractPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await params (Next.js 15+ requirement)
  const params = await searchParams;

  // Build query string to preserve session_id from Stripe
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value && typeof value === 'string') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  // Redirect to the unified experience route with query params
  const redirectUrl = queryString
    ? `/products/personal-alignment/experience?${queryString}`
    : '/products/personal-alignment/experience';

  redirect(redirectUrl);
}
