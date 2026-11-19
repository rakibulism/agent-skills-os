import { DocPage } from '@/components/DocPage';
import { API_DOC } from '@/content/tools';
import { pageMetadata } from '@/lib/doc';

export const metadata = pageMetadata(API_DOC.path, API_DOC.metaTitle, API_DOC.description);

export default function Page() {
  return <DocPage doc={API_DOC} />;
}
