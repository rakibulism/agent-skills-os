import { DocPage } from '@/components/DocPage';
import { CONTACT } from '@/content/trust';
import { pageMetadata } from '@/lib/doc';

export const metadata = pageMetadata(CONTACT.path, CONTACT.metaTitle, CONTACT.description);

export default function Page() {
  return <DocPage doc={CONTACT} />;
}
