import { FavIconSVG } from '@/components/favicon';

export const runtime = 'edge';

export default async function Image() {
  return FavIconSVG({
    icon: <>{'Mo.'}</>,
  });
}
