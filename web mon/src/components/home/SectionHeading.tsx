type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto text-center" : "text-left"} max-w-3xl`}>
      <p
        className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] ${centered ? "justify-center" : ""} ${
          inverse ? "text-[#e8a17e]" : "text-[#a9472d]"
        }`}
      >
        <span className={`h-px w-8 ${inverse ? "bg-[#e8a17e]/65" : "bg-[#a9472d]/55"}`} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display text-[clamp(2.55rem,4.5vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.025em] ${
          inverse ? "text-[#f5f1e8]" : "text-[#18353b]"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-6 max-w-2xl text-sm leading-7 md:text-[15px] md:leading-8 ${centered ? "mx-auto" : ""} ${
            inverse ? "text-white/62" : "text-[#5c6862]"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
