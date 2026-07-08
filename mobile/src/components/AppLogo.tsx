import { MapPin, ShieldCheck } from "lucide-react";

export function AppLogo() {
  return (
    <div className="app-logo" aria-label="Sistema GIS">
      <ShieldCheck size={30} />
      <MapPin size={18} className="app-logo-pin" />
    </div>
  );
}
