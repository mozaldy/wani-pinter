import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getParentStudentIds } from '@/lib/queries';

export default async function ParentDashboardPage() {
  const hdrs = await headers();
  const parentId = hdrs.get('x-parent-id');
  if (!parentId) redirect('/orang-tua/login');

  const studentIds = await getParentStudentIds(parentId);
  if (studentIds.length === 0) return notFound();

  redirect(`/orang-tua/anak/${studentIds[0]}`);
}
