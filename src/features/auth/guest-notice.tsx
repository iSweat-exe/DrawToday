/**
 * What being a guest means, in one place so the sign-in page and the profile say the same thing: the app works, but
 * nothing is saved in the cloud (what the guest does stays on this device).
 */
export function GuestNotice() {
  return (
    <div className="card flex flex-col gap-2 p-4">
      <span className="chip chip-accent self-start">Mode invité</span>
      <p className="text-sm text-muted">
        Tu peux tout essayer sans compte. Tes progrès restent sur cet appareil : ils ne sont pas
        sauvegardés en ligne et disparaissent si tu effaces les données du navigateur.
      </p>
    </div>
  );
}
