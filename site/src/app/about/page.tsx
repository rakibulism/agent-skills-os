import { DocPage } from '@/components/DocPage';
import { ABOUT } from '@/content/trust';
import { pageMetadata } from '@/lib/doc';

export const metadata = pageMetadata(ABOUT.path, ABOUT.metaTitle, ABOUT.description);

export default function Page() {
  return <DocPage doc={ABOUT} />;
}
