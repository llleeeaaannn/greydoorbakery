type Props = {
  height?: number;
  color?: string;
  strokeWidth?: number;
};

export function StarDoodle({ height = 120, color = '#B85C3E', strokeWidth = 6 }: Props) {
  return (
    <svg
      width={height}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M60 12 L72 48 L110 52 L80 76 L90 112 L60 92 L30 112 L40 76 L10 52 L48 48 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function CircleDoodle({ height = 120, color = '#B85C3E', strokeWidth = 6 }: Props) {
  return (
    <svg
      width={height}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M60 10 C 90 8, 112 30, 110 60 S 92 112, 60 110 S 8 92, 10 60 S 30 12, 60 10 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
