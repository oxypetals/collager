import React from "react";

const stickers = [
  "/assets/sticker1.png",
  "/assets/sticker2.png",
  "/assets/sticker3.png",
];

const LeftDrawer = () => {
  return (
    <div
      style={{
        width: "200px",
        background: "#f4f4f4",
        padding: "10px",
        overflowY: "auto",
      }}
    >
      <h3>Stickers</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {stickers.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Sticker ${index + 1}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("sticker", src)}
            style={{ width: "100px", cursor: "grab" }}
          />
        ))}
      </div>
    </div>
  );
};

export default LeftDrawer;
