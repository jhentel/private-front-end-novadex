export default function GlobalDefs() {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="circleGradientFixed" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DF74FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#562495" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
