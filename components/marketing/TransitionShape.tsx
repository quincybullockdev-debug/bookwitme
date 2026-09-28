export default function TransitionShape({
  variant,
}: {
  variant: "diagonal" | "wave" | "zigzag" | "curve";
}) {
  if (variant === "diagonal") {
    return (
      <svg
        viewBox="0 0 1440 100"
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        {/* A simple angled line cutting across the full width */}
        <polygon
          points="0,100 1440,0 1440,100"
          fill={"var(--brand-secondary, #e8ddc7)"}
        />
      </svg>
    );
  }

  if (variant === "wave") {
    return (
      <svg
        viewBox="0 0 1440 100"
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        {/* A smooth curve using a single quadratic bezier path — Q controls the curve's bend point */}
        <path
          d="M0,50 Q720,100 1440,50 L1440,100 L0,100 Z"
          fill={"var(--brand-secondary, #e8ddc7)"}
        />
      </svg>
    );
  }

  if (variant === "zigzag") {
    return (
      <svg
        viewBox="0 0 1440 100"
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        {/* Repeating peaks/valleys built from straight line segments */}
        <polyline
          points="0,50 180,20 360,50 540,20 720,50 900,20 1080,50 1260,20 1440,50 1440,100 0,100"
          fill={"var(--brand-secondary, #e8ddc7)"}
        />
      </svg>
    );
  }

  if (variant === "curve") {
    return (
      <svg
        viewBox="0 0 1440 100"
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        {/* A single smooth arc across the full width, opposite bend direction from "wave" */}
        <path
          d="M0,20 Q720,100 1440,20 L1440,100 L0,100 Z"
          fill={"var(--brand-secondary, #e8ddc7)"}
        />
      </svg>
    );
  }

  return null;
}
