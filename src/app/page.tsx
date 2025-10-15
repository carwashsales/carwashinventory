
'use client';

// This component is now much simpler.
// The main logic is in the root layout.
// This component will be rendered by the layout for the home page.
import { CarWashApp } from '@/components/car-wash-app';

export default function Home() {
  return <CarWashApp />;
}
