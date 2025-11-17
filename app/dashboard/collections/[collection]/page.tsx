import CollectionView from '@/components/CollectionView';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  return <CollectionView collectionName={collection} />;
}
