import React from "react";

function Sidebar({ trendGraphRef, setShowLogsTableModal }) {
  return (
    <div style={{
      width: "250px",
      minHeight: "100vh",
      backgroundColor: "#1f2937",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
      transition: "width 0.3s ease",
      zIndex: 100,
    }}>
      <h2 style={{ marginBottom: "40px", fontSize: "1.8rem" }}>ANOMALY DASHBOARD</h2>

      {/* Scroll to Dashboard top */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ marginBottom: "20px", cursor: "pointer" }}
      >
        Dashboard
      </div>

      {/* Open Logs Modal */}
      <div
        onClick={() => setShowLogsTableModal(true)}
        style={{ marginBottom: "20px", cursor: "pointer" }}
      >
        Logs
      </div>

      {/* Scroll to Trend Chart */}
      <div
        onClick={() => {
          if (trendGraphRef && trendGraphRef.current) {
            trendGraphRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }}
        style={{ marginBottom: "20px", cursor: "pointer" }}
      >
        Trend Chart
      </div>
    </div>
  );
}

export default Sidebar;
