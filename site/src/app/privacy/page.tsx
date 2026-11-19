import { DocPage } from '@/components/DocPage';
import { PRIVACY } from '@/content/trust';
import { pageMetadata } from '@/lib/doc';

export const metadata = pageMetadata(PRIVACY.path, PRIVACY.metaTitle, PRIVACY.description);

export default function Page() {
  return <DocPage doc={PRIVACY} />;
}
