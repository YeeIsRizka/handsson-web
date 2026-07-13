import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  className = "",
  onClick = () => {},
  fullWidth = false,
  ...props
}) => {
  const baseClasses =
    "flex justify-center items-center py-3 px-6 font-bold uppercase tracking-wide transition-all border-brutal shadow-brutal active:active-brutal";

  const variantClasses = {
    primary: "bg-neo-yellow text-neo-text hover:bg-[#FFE833]",
    secondary: "bg-neo-blue text-white hover:bg-blue-500",
    danger: "bg-neo-red text-white hover:bg-red-400",
    success: "bg-neo-green text-neo-text hover:bg-green-400",
    outline: "bg-neo-bg text-neo-text hover:bg-gray-100",
    ghost: "border-none shadow-none bg-transparent text-neo-text hover:bg-gray-200 active:transform-none active:shadow-none hover:-translate-y-1",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${widthClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
