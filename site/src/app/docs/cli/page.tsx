import { DocPage } from '@/components/DocPage';
import { CLI_DOC } from '@/content/tools';
import { pageMetadata } from '@/lib/doc';

export const metadata = pageMetadata(CLI_DOC.path, CLI_DOC.metaTitle, CLI_DOC.description);

export default function Page() {
  return <DocPage doc={CLI_DOC} />;
}
