import { useEffect, useRef, useState } from "react";
export default function Image({ image }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  // 🖱️ Zoom
  useEffect(() => {
    const el = containerRef.current;

    const handleWheel = (e) => {
      e.preventDefault();

      setScale((prev) => {
        let next = prev + (e.deltaY < 0 ? 0.2 : -0.2);
        return Math.min(Math.max(1, next), 5);
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // 🖱️ Start drag
  const handleMouseDown = (e) => {
    if (scale === 1) return; // only drag when zoomed
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);
  // 🖱️ Move
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // 🖱️ Stop drag
  const handleMouseUp = () => setDragging(false);
  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: scale > 1 ? "grab" : "default" }}
    >
      <img
        src={image}
        alt="preview"
        draggable={false}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.1s ease-out",
        }}
        className="w-full h-full object-contain object-center"
      />
    </div>
  );
}
