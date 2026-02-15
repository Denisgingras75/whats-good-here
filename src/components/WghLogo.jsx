/**
 * WghLogo — Location pin with Martha's Vineyard silhouette inside.
 * Same pin shape as the town picker, with MV island replacing the center dot.
 */
export function WghLogo({ size = 64, color = 'var(--color-primary)', className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 24 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="What's Good Here logo"
      role="img"
    >
      {/* Pin shape — same as town picker */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={color}
      />
      {/* MV island silhouette — simplified, sits where the dot would be */}
      <path
        d="M8.2 9.8 C8 9.4 8.2 9 8.5 8.6 L9 8.2 C9.2 8.3 9.5 8.1 9.8 7.9 L10.2 7.6 C10.5 7.4 10.8 7.5 11.1 7.3 L11.5 7.1 C11.8 7 12.1 7.1 12.4 7 L12.8 6.9 C13.1 6.8 13.4 7 13.7 7.1 L14.1 7.3 C14.4 7.5 14.6 7.3 14.8 7.5 L15.2 7.8 C15.4 8 15.3 8.2 15.5 8.4 L15.7 8.8 C15.8 9 15.6 9.2 15.5 9.4 L15.2 9.6 C15 9.7 14.7 9.5 14.4 9.6 L14 9.8 C13.7 9.9 13.4 9.7 13.1 9.8 L12.7 9.9 C12.4 10 12.1 9.8 11.8 9.9 L11.4 10 C11.1 10.1 10.8 9.9 10.5 10 L10.1 10.1 C9.8 10.2 9.5 10 9.2 10.1 L8.8 10 C8.5 10 8.3 10 8.2 9.8 Z"
        fill="var(--color-bg)"
      />
    </svg>
  )
}
