
function GiftIcon({ size = 24, color = "currentColor", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="9"
        width="18"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M12 9V21M3 13H21"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M12 9H7.5C5.8 9 5 8 5 6.8C5 5.5 6 5 7 5C9.5 5 12 9 12 9Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 9H16.5C18.2 9 19 8 19 6.8C19 5.5 18 5 17 5C14.5 5 12 9 12 9Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default GiftIcon;
