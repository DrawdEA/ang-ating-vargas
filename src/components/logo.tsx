// The UP Vargas Museum logo, with its white background removed (public/vargas-logo.png).
export function Logo({ className = "" }: { className?: string }) {
  return <img className={`logo ${className}`} src="/vargas-logo.png" alt="Vargas Museum" width={600} height={624} />;
}
