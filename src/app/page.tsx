import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root to /today as the default view
  redirect('/today');
}
