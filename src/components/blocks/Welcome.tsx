import React, { useEffect, useState } from "react";

const Welcome: React.FC = () => {
  const fullMessage = "Welcome to ReYapp";
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    if (visibleLetters >= fullMessage.length) return;

    const interval = setInterval(() => {
      setVisibleLetters(prev => prev + 1);
    }, 150); 

    return () => clearInterval(interval);
  }, [visibleLetters, fullMessage.length]);

  return (
    <h1>
      {fullMessage.slice(0, visibleLetters)}
    </h1>
  );
};

export default Welcome;
