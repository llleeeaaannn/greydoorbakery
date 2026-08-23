type Props = {
  width?: number;
  color?: string;
  strokeWidth?: number;
};

export function Squiggle({ width = 320, color = '#B85C3E', strokeWidth = 4 }: Props) {
  return (
    <svg
      width={width}
      height={24}
      viewBox="0 0 320 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M2 14 C 30 4, 60 22, 90 12 S 150 2, 180 14 S 240 22, 270 10 S 310 18, 318 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function SquiggleUnderline({ width = 180, color = '#B85C3E', strokeWidth = 3 }: Props) {
  return (
    <svg
      width={width}
      height={10}
      viewBox="0 0 180 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M2 6 C 30 2, 60 9, 90 5 S 150 2, 178 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
