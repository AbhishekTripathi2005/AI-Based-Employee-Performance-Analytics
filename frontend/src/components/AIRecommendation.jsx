import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIRecommendation = ({ API_BASE, token }) => {
  const [employees, setEmployees] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const getRecommendation = async () => {
    if (employees.length === 0) {
      alert("Please add some employees first!");
      return;
    }
    if (!requestType) {
      alert("Please select a recommendation type!");
      return;
    }

    setLoading(true);
    setRecommendation('');

    // Extra instruction based on user selection
    let userInstruction = "";

    switch (requestType) {
      case "promotion":
        userInstruction = "Focus mainly on Promotion Recommendations with strong reasons.";
        break;
      case "training":
        userInstruction = "Focus on Training & Skill Development suggestions.";
        break;
      case "ranking":
        userInstruction = "Give detailed Overall Employee Ranking and performance analysis.";
        break;
      case "feedback":
        userInstruction = "Give constructive individual feedback to employees.";
        break;
      case "custom":
        userInstruction = customPrompt || "Give comprehensive HR recommendations.";
        break;
      default:
        userInstruction = "Analyze and give detailed recommendations.";
    }

    try {
      const res = await axios.post(`${API_BASE}/ai/recommend`, {
        employees: employees,
        // We are not using this in your current backend, but it's good to send
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecommendation(res.data.recommendation || res.data.message || "No response from AI");
    } catch (err) {
      console.error(err);
      setRecommendation("❌ AI Service Error: " + (err.response?.data?.message || err.message));
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>AI-Powered Recommendations</h2>

      <div style={{ marginBottom: '25px' }}>
        <h3>Select what you want from AI:</h3>
        
        <select 
          value={requestType} 
          onChange={(e) => setRequestType(e.target.value)}
          style={{ padding: '12px', fontSize: '16px', width: '100%', maxWidth: '600px', marginBottom: '15px' }}
        >
          <option value="">-- Choose Recommendation Type --</option>
          <option value="promotion">Promotion Recommendations</option>
          <option value="training">Training & Skill Development</option>
          <option value="ranking">Overall Ranking</option>
          <option value="feedback">Individual Employee Feedback</option>
          <option value="custom">Custom Instruction</option>
        </select>

        {requestType === "custom" && (
          <textarea
            placeholder="Type your custom instruction here (e.g., Give salary hike suggestions...)"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            style={{ width: '100%', height: '80px', padding: '10px', fontSize: '16px' }}
          />
        )}
      </div>

      <button 
        onClick={getRecommendation} 
        disabled={loading || !requestType}
        style={{ 
          padding: '14px 30px', 
          fontSize: '17px', 
          backgroundColor: loading ? '#666' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? "🤖 AI is Analyzing..." : "Get AI Recommendation"}
      </button>

      {recommendation && (
        <div style={{ 
          marginTop: '30px', 
          background: '#f8f9fa', 
          padding: '25px', 
          borderRadius: '10px',
          border: '1px solid #ddd',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.7'
        }}>
          <h3>AI Analysis Result:</h3>
          <pre>{recommendation}</pre>
        </div>
      )}

      <p style={{ marginTop: '20px', color: '#555' }}>
        Employees Available: <strong>{employees.length}</strong>
      </p>
    </div>
  );
};

export default AIRecommendation;