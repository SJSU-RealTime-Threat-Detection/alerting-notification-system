// Navbar.js
import React from "react";

function Navbar({ downloadCSV, darkMode, setDarkMode, fetchLogs  }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: "250px",
      right: 0,
      height: "70px",
      backgroundColor: "#1f2937",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 30px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 100,
      borderBottom: "1px solid #e0e0e0",
      transition: "background 0.3s ease"
    }}>
       <h2 style={{ marginBottom: "40px", fontSize: "1.8rem", color: "white" }}></h2>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button
          onClick={downloadCSV}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(to right, #ff7e5f, #feb47b)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          📥 Export CSV
        </button>

        <button
  onClick={fetchLogs}
  style={{
    marginLeft: "10px",
    padding: "8px 16px",
    background: "linear-gradient(to right, #38b2ac, #319795)",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  }}
>
  🔄 Refresh
</button>
        <label style={{
          position: "relative",
          display: "inline-block",
          width: "60px",
          height: "34px",
        }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            style={{
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
          <span style={{
            position: "absolute",
            cursor: "pointer",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: darkMode ? "#00c6ff" : "#ccc",
            transition: ".4s",
            borderRadius: "34px"
          }}></span>
          <span style={{
            position: "absolute",
            height: "26px",
            width: "26px",
            left: "4px",
            bottom: "4px",
            backgroundColor: "white",
            transition: ".4s",
            borderRadius: "50%",
            transform: darkMode ? "translateX(26px)" : "translateX(0px)"
          }}></span>
        </label>
      </div>

    </div>
  );
}

export default Navbar;
