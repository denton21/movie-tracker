import HomeClient from './HomeClient';
import FriendsStatusTicker from '@/components/FriendsStatusTicker';
import { getFriendsActivity } from '@/actions/friends';
import type { FriendActivity } from '@/components/FriendsStatusTicker';

export default async function HomePage() {
  // Fetch friends activity server-side (fails gracefully if not logged in)
  let activities: FriendActivity[] = [];
  try {
    activities = await getFriendsActivity(25);
  } catch {
    // Not logged in — no ticker
  }

  return (
    <>
      <HomeClient />
      <FriendsStatusTicker activities={activities} />
    </>
  );
}
