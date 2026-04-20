import React from "react";

const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  let dimension = "h-6 w-6 border-2";
  if (size === "lg") dimension = "h-10 w-10 border-4";
  if (size === "sm") dimension = "h-4 w-4 border";
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-accent ${dimension}`}
      role="status"
      aria-label="loading"
    />
  );
};

export default Spinner;
