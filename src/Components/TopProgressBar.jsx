import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const TopProgressBar = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-[9999] h-1 w-full bg-orange-100">
      <div className="h-full w-full origin-left animate-page-progress bg-orange-500" />
    </div>
  );
};

export default TopProgressBar;