type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function DoorMark({ size = 48, color = '#1E1F21', strokeWidth = 3 }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 40 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="50"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <line x1="20" y1="4" x2="20" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="4" y1="20" x2="36" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="4" y1="36" x2="36" y2="36" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
