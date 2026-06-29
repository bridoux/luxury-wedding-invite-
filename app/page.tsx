import PrivateGate from "@/components/PrivateGate";

/**
 * The invitation is private: the bare domain shows a gate. Guests view their
 * invitation only via their personal link, /invite/[guestCode].
 */
export default function HomePage() {
  return <PrivateGate />;
}
