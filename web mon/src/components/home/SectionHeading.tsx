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
        className={`font-display italic text-xl ${centered ? "justify-center" : ""} ${
          inverse ? "text-[#e8a17e]" : "text-[#A84F36]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`moon-title mt-3 font-semibold ${
          inverse ? "text-[#f5f1e8]" : "text-[#1C1612]"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-6 max-w-2xl text-sm leading-7 md:text-[15px] md:leading-8 ${centered ? "mx-auto" : ""} ${
            inverse ? "text-white/62" : "text-[#3D352E]"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
