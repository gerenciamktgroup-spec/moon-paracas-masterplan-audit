import { Link } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";
import { THRESHOLDS } from "../../lib/thresholds";

export function IntentPathSection() {
  return (
    <nav
      data-testid="intent-path-section"
      aria-label="Cinco umbrales"
      className="border-b border-[#E8E1D5] bg-[#FAF8F5]"
    >
      <div className="no-scrollbar mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 py-4 sm:px-8 lg:grid lg:grid-cols-5 lg:gap-0 lg:overflow-visible lg:px-12">
        {THRESHOLDS.map((path) => {
          const className =
            "group flex min-w-[9.5rem] flex-col gap-1 px-3 py-2 transition-colors hover:bg-[#F4EFE6] lg:min-w-0 lg:px-4";
          const content = (
            <>
              <span className="font-display text-lg text-[#C5A059]">{path.roman}</span>
              <span className="font-display text-xl leading-none text-[#1C1612]">{path.name}</span>
              <span className="mt-1 hidden text-xs leading-5 text-[#786F66] sm:block">{path.line}</span>
            </>
          );

          return path.href.startsWith("/") ? (
            <Link
              key={path.id}
              to={path.href}
              viewTransition
              data-testid="intent-card"
              className={className}
              onClick={() => trackEvent("select_intent", { intent: path.name, destination: path.href })}
            >
              {content}
            </Link>
          ) : (
            <a
              key={path.id}
              href={path.href}
              data-testid="intent-card"
              className={className}
              onClick={() => trackEvent("select_intent", { intent: path.name, destination: path.href })}
            >
              {content}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
