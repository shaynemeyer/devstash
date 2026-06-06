import { db } from '@/lib/db';
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from '@/lib/constants';

export async function checkItemLimit(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { isPro: true } });
  if (user?.isPro) return null;

  const count = await db.item.count({ where: { userId } });
  if (count >= FREE_TIER_ITEM_LIMIT) {
    return `Free plan is limited to ${FREE_TIER_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`;
  }
  return null;
}

export async function checkCollectionLimit(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { isPro: true } });
  if (user?.isPro) return null;

  const count = await db.collection.count({ where: { userId } });
  if (count >= FREE_TIER_COLLECTION_LIMIT) {
    return `Free plan is limited to ${FREE_TIER_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`;
  }
  return null;
}
