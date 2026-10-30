import { SettingsClient } from '@/components/SettingsClient';
import { requireTeacher } from '@/lib/auth';

export default async function SettingsPage() {
  const { nama, initials } = await requireTeacher();
  return <SettingsClient user={{ nama, initials }} />;
}
