import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

function Toast({ show, message, onClose }) {
  useEffect(() => {
    if (show) {
      const toastElement = document.getElementById("errorToast");
      const toast = new window.bootstrap.Toast(toastElement);
      toast.show();
    }
  }, [show]);

  return (
    <div
      className="toast align-items-center text-white bg-danger border-0 position-fixed bottom-0 end-0 m-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      id="errorToast"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          username,
          password,
        }
      );
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login.";
      setError(errorMessage);
      setShowToast(true);
    }
  };

  return (
    <div className="container">
      <div className="card mx-auto mt-5" style={{ maxWidth: "400px" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-2">
              Login
            </button>
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </form>
        </div>
      </div>
      <Toast
        show={showToast}
        message={error}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        username,
        password,
      });
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred during registration.";
      setError(errorMessage);
      setShowToast(true);
    }
  };

  return (
    <div className="container">
      <div className="card mx-auto mt-5" style={{ maxWidth: "400px" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Register</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-2">
              Register
            </button>
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
      <Toast
        show={showToast}
        message={error}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const fetchProtectedData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/protected`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setData(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/refresh-token`,
            { refreshToken }
          );
          localStorage.setItem("accessToken", response.data.accessToken);
          fetchProtectedData(); // Retry with new token
        } catch (refreshError) {
          setError("Session expired. Please log in again.");
          setShowToast(true);
          navigate("/");
        }
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "An error occurred while fetching data.";
        setError(errorMessage);
        setShowToast(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {
        refreshToken,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during logout.";
      setError(errorMessage);
      setShowToast(true);
    }
  };

  return (
    <div className="container">
      <div className="card mx-auto mt-5" style={{ maxWidth: "800px" }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Dashboard</h2>
          <div className="d-flex justify-content-between mb-3">
            <button className="btn btn-primary" onClick={fetchProtectedData}>
              Fetch Protected Data
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
          {data && (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
      <Toast
        show={showToast}
        message={error}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default App;
