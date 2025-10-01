import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button: React.FC<ButtonProps> = ({ variant = "primary", className = "", ...props }) => {
  const base = "px-3 py-2 rounded text-sm font-medium";
  const styles = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-900 hover:bg-gray-300";
  return <button className={[base, styles, className].join(" ")} {...props} />;
};
