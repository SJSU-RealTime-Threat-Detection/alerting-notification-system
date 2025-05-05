import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import CountUp from "react-countup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AnomalyLogs.css";
import ReactMarkdown from "react-markdown";


function AnomalyLogs() {
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [showLogsTableModal, setShowLogsTableModal] = useState(false);
  const trendGraphRef = useRef(null);
  const [llmModalData, setLlmModalData] = useState(null);

  const fetchLogs = () => {
    fetch("https://gqnrzzz2uh.execute-api.us-west-2.amazonaws.com/prod/logs")
      .then(response => response.json())
      .then(data => {
        setBatches(data);
        toast.info("🔄 Data refreshed");
      })
      .catch(error => {
        console.error("Error fetching logs:", error);
        toast.error("❌ Failed to refresh");
      });
  };
  

  const allLogs = batches.flatMap(batch => batch.logs);
  const totalLogs = allLogs.length;
  const criticalLogs = allLogs.filter(log => log.anomaly_score >= 0.9).length;
  const warningLogs = allLogs.filter(log => log.anomaly_score >= 0.5 && log.anomaly_score < 0.9).length;

  useEffect(() => {
    fetchLogs(); 
  }, []);
  

  const toggleBatch = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const downloadCSV = () => {
    if (!batches.length) {
      toast.error("⚠️ No data available to export!");
      return;
    }
    const rows = batches.flatMap(batch => batch.logs.map(log => ({
      Timestamp: batch.timestamp,
      ...log,
      LLM_Response: batch.llm_response
    })));
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(h => JSON.stringify(row[h] || "")).join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anomaly_logs.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("✅ Logs exported successfully!");
  };
 
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: "yellow", fontWeight: "bold" }}>{part}</mark>
      ) : (part)
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj)) return timestamp;
    return dateObj.toLocaleString();
  };
  
  const formatLogToApacheStyle = (log) => {
    const ip = log.client_ip || "-";
    const timestamp = log.timestamp || "-";
    const method = log.http_method || "GET";
    const url = log.url || "/";
    const protocol = "HTTP/1.1";
    const status = log.response_code || 200;
    const size = log.response_size || "-";
    const referrer = log.referrer ? `"${log.referrer}"` : '"-"';
    const userAgent = log.user_agent ? `"${log.user_agent}"` : '"-"';
  
    return `${ip} - - [${timestamp}] "${method} ${url} ${protocol}" ${status} ${size} ${referrer} ${userAgent}`;
  };
  

  // ✅ Modal Component
const LogsModal = ({ logs, onClose, darkMode }) => {
  if (!logs) return null;
  
  

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#1f2937",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "80vh",
        overflowY: "auto",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        position: "relative"
      }}>
        <h2 style={{ marginBottom: "20px" }}>📋 Logs for Selected Batch</h2>
        
        <button onClick={onClose} style={{
          position: "absolute",
          top: "15px",
          right: "20px",
          fontSize: "1.5rem",
          border: "none",
          background: "none",
          color: darkMode ? "#f9fafb" : "#1f2937",
          cursor: "pointer"
        }}>✖</button>

{logs.map((log, index) => (
  <div
    key={index}
    style={{
      backgroundColor: darkMode ? "#374151" : "#f9fafb",
      marginBottom: "12px",
      padding: "12px",
      fontFamily: "monospace",
      borderRadius: "8px",
      fontSize: "0.95rem",
      color: darkMode ? "#f9fafb" : "#111827"
    }}
  >
    {formatLogToApacheStyle(log)}
  </div>
))}

      </div>
    </div>
  );
};



const LogsTableModal = ({ batches, searchTerm, darkMode, onClose, highlightText, toggleBatch, formatTimestamp }) => {
  
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#1f2937",
        width: "95%",
        maxWidth: "1200px",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "12px",
        padding: "30px",
        position: "relative"
      }}>
        <h2 style={{ marginBottom: "20px" }}>📋 Logs Table</h2>
        <button onClick={onClose} style={{
          position: "absolute",
          top: "15px",
          right: "20px",
          fontSize: "1.5rem",
          border: "none",
          background: "none",
          color: darkMode ? "#f9fafb" : "#1f2937",
          cursor: "pointer"
        }}>✖</button>

        <div style={{ overflowX: "auto" }}>
          <table className="logs-table">
            <thead>
              <tr style={{ backgroundColor: darkMode ? "#374151" : "#f1f5f9" }}>
                <th>Timestamp</th>
                <th>LLM Response</th>
                <th style={{ textAlign: "center" }}>Logs</th>
              </tr>
            </thead>
            <tbody>
              {batches
                .filter(batch => {
                  const combinedText = (JSON.stringify(batch) + (batch.logs || []).map(log => JSON.stringify(log)).join(" ")).toLowerCase();
                  return combinedText.includes(searchTerm.toLowerCase());
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((batch) => (
                  <tr key={batch.log_id} style={{ backgroundColor: darkMode ? "#374151" : "#ffffff" }}>
  <td>{formatTimestamp(batch.timestamp)}</td>

  {/* LLM Response Column */}
  <td style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
  <code style={{
    fontSize: "0.75rem",
    color: "#9ca3af",
    fontFamily: "monospace",
    wordBreak: "break-all"
  }}>
    {batch.log_id}
  </code>

  {extractExecutiveSummary(batch.llm_response) && (
    <div style={{
      fontSize: "0.85rem",
      lineHeight: "1.4",
      color: darkMode ? "#e5e7eb" : "#1f2937",
      maxHeight: "90px",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }}>
      <strong>Summary:</strong> {extractExecutiveSummary(batch.llm_response)}
    </div>
  )}

  <button
    className="view-logs-button"
    onClick={() =>
      setLlmModalData({ logId: batch.log_id, llmResponse: batch.llm_response })
    }
  >
    View Report
  </button>
</td>


  {/* Logs Column */}
  <td style={{ textAlign: "center" }}>
    <button
      className="view-logs-button"
      onClick={() => setSelectedLogs(batch.logs)}
    >
      View Logs
    </button>
  </td>
</tr>

                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function parseApacheTimestamp(ts) {
  try {
    const match = ts.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/);
    if (!match) return null;

    const [, day, monthStr, year, time] = match;

    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const month = monthMap[monthStr];
    if (!month) return null;

    return `${year}-${month}-${day}T${time}Z`;
  } catch {
    return null;
  }
}
const LLMResponseModal = ({ logId, llmResponse, onClose, darkMode }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1100
    }}>
      <div style={{
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#1f2937",
        width: "90%",
        maxWidth: "700px",
        maxHeight: "80vh",
        overflowY: "auto",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        position: "relative"
      }}>
        <h2 style={{ marginBottom: "20px" }}>🧠 LLM Response for <code>{logId}</code></h2>
        <button onClick={onClose} style={{
          position: "absolute",
          top: "15px",
          right: "20px",
          fontSize: "1.5rem",
          border: "none",
          background: "none",
          color: darkMode ? "#f9fafb" : "#1f2937",
          cursor: "pointer"
        }}>✖</button>

        <pre style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          fontSize: "0.95rem",
          backgroundColor: darkMode ? "#374151" : "#f9fafb",
          padding: "15px",
          borderRadius: "8px",
          lineHeight: 1.5
        }}>{llmResponse}</pre>
      </div>
    </div>
  );
};

const extractExecutiveSummary = (text) => {
  const start = text.indexOf("Executive Summary");
  const end = text.indexOf("Incident Metadata");

  if (start !== -1 && end !== -1 && end > start) {
    return text
      .slice(start + "Executive Summary".length, end)
      .replace(/[-=]+/g, "") // remove heading lines
      .trim();
  }

  return null;
};







const getHourlyCriticalCounts = () => {
  const hourMap = {};

  allLogs.forEach(log => {
    if (!log.timestamp) return;

    const parsedTs = parseApacheTimestamp(log.timestamp);
    if (!parsedTs) return;

    const date = new Date(parsedTs);
    if (log.anomaly_score >= 0.9 && !isNaN(date)) {
      const hourKey = date.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
      hourMap[hourKey] = (hourMap[hourKey] || 0) + 1;
    }
  });

  return Object.entries(hourMap)
    .map(([hour, count]) => ({
      hour: hour.replace("T", " ") + ":00",
      count
    }))
    .sort((a, b) => new Date(a.hour) - new Date(b.hour));
};


const hourlyData = getHourlyCriticalCounts();

console.log("hourlyData:", hourlyData);

console.log("critical logs", allLogs.filter(log => log.anomaly_score >= 0.9));

  return (
    <div className="dashboard-container" style={{ background: darkMode ? "#111827" : undefined }}>
<Sidebar
  trendGraphRef={trendGraphRef}
  setShowLogsTableModal={setShowLogsTableModal}
/>
      <div className="main-content">
      <Navbar 
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  downloadCSV={downloadCSV}
  darkMode={darkMode}
  setDarkMode={setDarkMode}
  fetchLogs={fetchLogs} // ✅ add this
/>


        {/* KPI Cards */}
        <div className="kpi-cards">
          <div className="kpi-card" style={{ background: darkMode ? "#1f2937" : "#ffffff", color: darkMode ? "#f9fafb" : "#1f2937" }}>
            <h3>📋 Total Logs</h3>
            <h1><CountUp end={totalLogs} duration={2} /></h1>
          </div>
          <div className="kpi-card" style={{ background: darkMode ? "#1f2937" : "#ffffff", color: darkMode ? "#f9fafb" : "#1f2937" }}>
            <h3>🚨 Critical Logs</h3>
            <h1 style={{ color: "#ef4444" }}><CountUp end={criticalLogs} duration={2} /></h1>
          </div>
          <div className="kpi-card" style={{ background: darkMode ? "#1f2937" : "#ffffff", color: darkMode ? "#f9fafb" : "#1f2937" }}>
            <h3>⚠️ Warning Logs</h3>
            <h1 style={{ color: "#f59e0b" }}><CountUp end={warningLogs} duration={2} /></h1>
          </div>
        </div>

        {showLogsTableModal && (
  <LogsTableModal
  
    batches={batches}
    searchTerm={searchTerm}
    darkMode={darkMode}
    onClose={() => setShowLogsTableModal(false)}
    highlightText={highlightText}
    toggleBatch={toggleBatch}
    formatTimestamp={formatTimestamp}
  />
)}
{llmModalData && (
  <LLMResponseModal
    logId={llmModalData.logId}
    llmResponse={llmModalData.llmResponse}
    darkMode={darkMode}
    onClose={() => setLlmModalData(null)}
  />
)}

<div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
  {/* Left: Anomaly Score Trend */}
  <div
  ref={trendGraphRef}
  className="graph-container"
  style={{
    flex: 1,
    minWidth: "300px",
    background: darkMode ? "#1f2937" : "#ffffff"
  }}
>
    <h2 style={{ color: darkMode ? "#f9fafb" : "#1f2937" }}>📈 Anomaly Score Trend</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={batches.flatMap(batch =>
        batch.logs.map(log => ({
          raw_timestamp: batch.timestamp,
          formatted_timestamp: formatTimestamp(batch.timestamp),
          anomaly_score: log.anomaly_score
        }))
      ).sort((a, b) => new Date(a.raw_timestamp) - new Date(b.raw_timestamp))}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formatted_timestamp" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Line type="monotone" dataKey="anomaly_score" stroke="#6366f1" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Right: Hourly Anomaly Frequency */}
  <div
  className="graph-container"
  style={{
    flex: 1,
    minWidth: "300px",
    background: darkMode ? "#1f2937" : "#ffffff"
  }}
>
    <h2 style={{ color: darkMode ? "#f9fafb" : "#1f2937" }}>🕒 Hourly Anomaly Frequency</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={hourlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

        
        {selectedLogs && (
  <LogsModal logs={selectedLogs} onClose={() => setSelectedLogs(null)} darkMode={darkMode} />
)}


        {/* Toasts */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
    
  );
}

export default AnomalyLogs;
