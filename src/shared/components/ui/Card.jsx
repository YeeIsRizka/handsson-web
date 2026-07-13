import React from "react";

const Card = ({ children, className = "", color = "bg-neo-bg", padding = "p-6" }) => {
  return (
    <div className={`${color} border-brutal shadow-brutal ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
