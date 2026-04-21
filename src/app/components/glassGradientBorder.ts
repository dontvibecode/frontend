type GlassGradientBorderProps = {
  gradientClass: string;
  outerBorderRadiusClass: string;
  innerBorderRadiusStyle: { borderRadius: string };
};

const TAILWIND_RADIUS_TO_PX: Record<string, number> = {
  "rounded-none": 0,
  rounded: 4,
  "rounded-sm": 2,
  "rounded-md": 6,
  "rounded-lg": 8,
  "rounded-xl": 12,
  "rounded-2xl": 16,
  "rounded-3xl": 24,
  "rounded-full": 9999,
};

function parseArbitraryRoundedPx(borderRadiusClass: string): number | null {
  const arbitraryMatch = borderRadiusClass.match(/^rounded-\[(.+)\]$/);
  if (!arbitraryMatch) return null;

  const rawValue = arbitraryMatch[1].trim();

  if (rawValue.endsWith("px")) {
    const px = Number(rawValue.replace("px", ""));
    return Number.isFinite(px) ? px : null;
  }

  if (rawValue.endsWith("rem")) {
    const rem = Number(rawValue.replace("rem", ""));
    return Number.isFinite(rem) ? rem * 16 : null;
  }

  return null;
}

function getGlassGradientBorderRadiusProps(
  borderRadius: string = "rounded-xl",
): Pick<GlassGradientBorderProps, "outerBorderRadiusClass" | "innerBorderRadiusStyle"> {
  const mapped = TAILWIND_RADIUS_TO_PX[borderRadius];
  const parsed = mapped ?? parseArbitraryRoundedPx(borderRadius) ?? 12;
  const innerRadiusPx = Math.max(parsed - 1, 0);

  return {
    outerBorderRadiusClass: borderRadius,
    innerBorderRadiusStyle: { borderRadius: `${innerRadiusPx}px` },
  };
}

export function getGlassGradientBorderClass(
  resolvedTheme?: string,
  borderRadius: string = "rounded-xl",
): GlassGradientBorderProps {
  return {
    gradientClass:
      resolvedTheme === "dark"
        ? "bg-[linear-gradient(45deg,rgba(255,255,255,0.5)_0%,rgba(156,163,175,0.3)_50%,rgba(255,255,255,0.5)_100%)]"
        : "bg-[linear-gradient(145deg,rgba(255,255,255,1)_0%,rgba(165,165,165,0.9)_50%,rgba(255,255,255,1)_100%)]",
    ...getGlassGradientBorderRadiusProps(borderRadius),
  };
}

export function getGlassGradientBorderClassInner(
  resolvedTheme?: string,
  borderRadius: string = "rounded-xl",
): GlassGradientBorderProps {
  return {
    gradientClass:
      resolvedTheme === "dark"
        ? "bg-[linear-gradient(45deg,rgba(255,255,255,0.5)_0%,rgba(156,163,175,0.2)_50%,rgba(255,255,255,0.5)_100%)]"
        : "bg-[linear-gradient(145deg,rgba(204,204,204,0.5)_0%,rgba(165,165,165,0.5)_50%,rgba(204,204,204,0.5)_100%)]",
    ...getGlassGradientBorderRadiusProps(borderRadius),
  };
}