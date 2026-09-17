'use client';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function PrintButton() {
  const { dict } = useI18n();
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      <Icon name="fileText" size={13} /> {dict.rpp.editor.print}
    </button>
  );
}
