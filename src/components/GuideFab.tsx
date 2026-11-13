import { Link, useRouterState } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";

// The same golden Durga trishula mark used on the kanakadurga.ai landing page.
const mark = import.meta.glob<{ url: string }>("../assets/durga-trishula.png.asset.json", {
  eager: true,
  import: "default",
});
const trishula = mark["../assets/durga-trishula.png.asset.json"]?.url;

/** Floating help-desk button that opens the Ask the Guide page. */
export function GuideFab() {
  const { t } = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/guide" || path === "/") return null;
  return (
    <Link
      to="/guide"
      aria-label={t("askGuide")}
      title={t("askGuide")}
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-sanctum shadow-glow transition-transform hover:scale-110"
    >
      {trishula ? (
        <img
          src={trishula}
          alt=""
          aria-hidden
          className="h-11 w-11 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
        />
      ) : null}
    </Link>
  );
}
