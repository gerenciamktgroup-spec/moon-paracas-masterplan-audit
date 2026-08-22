export function SilenceNote({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#E8E1D5] bg-[#FAF8F5] px-6 py-14 text-center">
      <div className="moon-seal mx-auto" aria-hidden="true">M</div>
      <p className="mt-6 font-display text-2xl text-[#1C1612] sm:text-3xl">{title}</p>
      {body ? <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#786F66]">{body}</p> : null}
    </div>
  );
}
