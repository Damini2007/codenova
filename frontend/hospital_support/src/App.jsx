import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8001";

function App() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("1");
  const [isRegistering, setIsRegistering] = useState(false);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [requests, setRequests] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("");
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");


  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (e) => {

    e.preventDefault();

    try {

      const formData = new URLSearchParams();

      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(
        `${API_URL}/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      setToken(response.data.access_token);

      alert("Login successful!");

      getRequests(response.data.access_token);

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Login failed"
      );
    }
  };

  const register = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/users`, {
        username,
        password,
        role: Number(role),
      });

      setPassword("");
      setIsRegistering(false);
      alert("Account created. Please log in.");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Unable to create account"
      );
    }
  };


  // =====================================================
  // GET REQUESTS
  // =====================================================

  const getRequests = async (currentToken = token) => {

    try {

      const response = await axios.get(
        `${API_URL}/requests`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      setRequests(response.data);

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Unable to get support requests"
      );
    }
  };


  // =====================================================
  // CREATE REQUEST
  // =====================================================

  const createRequest = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        `${API_URL}/requests`,
        {
          patient_name: patientName,
          patient_id: patientId,
          department: department,
          request_type: requestType,
          description: description,
          priority: priority,
          status: status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Support request created successfully!");

      setPatientName("");
      setPatientId("");
      setDepartment("");
      setRequestType("");
      setDescription("");
      setPriority("Medium");
      setStatus("Pending");

      setShowForm(false);

      getRequests();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Unable to create support request"
      );
    }
  };


  // =====================================================
  // DELETE REQUEST
  // =====================================================

  const deleteRequest = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this request?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await axios.delete(
        `${API_URL}/requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Request deleted successfully!");

      getRequests();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Unable to delete request"
      );
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);

    setRequests([]);
  };


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!token) {

    return (

      <div className="login-page">

        <div className="login-card">

          <h1>Hospital Support</h1>

          <p>
            {isRegistering ? "Create your support account" : "Support Request Management System"}
          </p>

          <form onSubmit={isRegistering ? register : login}>

            {isRegistering && (
              <>
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="1">Department Staff</option>
                  <option value="2">Support Engineer</option>
                  <option value="3">Team Lead</option>
                  <option value="4">Admin</option>
                </select>
              </>
            )}

            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />


            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />


            <button type="submit">
              {isRegistering ? "Create Account" : "Login"}
            </button>

          </form>

          <button
            className="auth-toggle"
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Already registered? Log in" : "Need an account? Create one"}
          </button>

        </div>

      </div>

    );
  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="app">

      <header className="navbar">

        <div>

          <h1>
            Hospital Support Request System
          </h1>

          <p>
            Manage hospital support requests
          </p>

        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      <main className="container">


        {/* BUTTONS */}

        <div className="top-actions">

          <button
            onClick={() => setShowForm(!showForm)}
          >
            {showForm
              ? "Close Form"
              : "+ Create Support Request"}
          </button>


          <button
            onClick={() => getRequests()}
          >
            Refresh Requests
          </button>

        </div>


        {/* CREATE FORM */}

        {showForm && (

          <div className="form-card">

            <h2>
              Create Support Request
            </h2>


            <form onSubmit={createRequest}>

              <label>
                Patient Name
              </label>

              <input
                type="text"
                value={patientName}
                onChange={(e) =>
                  setPatientName(e.target.value)
                }
                required
              />


              <label>
                Patient ID
              </label>

              <input
                type="text"
                value={patientId}
                onChange={(e) =>
                  setPatientId(e.target.value)
                }
                required
              />


              <label>
                Department
              </label>

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                required
              >

                <option value="">
                  Select Department
                </option>

                <option value="Emergency">
                  Emergency
                </option>

                <option value="Cardiology">
                  Cardiology
                </option>

                <option value="Neurology">
                  Neurology
                </option>

                <option value="General Medicine">
                  General Medicine
                </option>

                <option value="Pediatrics">
                  Pediatrics
                </option>

                <option value="Pharmacy">
                  Pharmacy
                </option>

              </select>


              <label>
                Request Type
              </label>

              <select
                value={requestType}
                onChange={(e) =>
                  setRequestType(e.target.value)
                }
                required
              >

                <option value="">
                  Select Request Type
                </option>

                <option value="Medical Assistance">
                  Medical Assistance
                </option>

                <option value="Equipment">
                  Equipment
                </option>

                <option value="Room Support">
                  Room Support
                </option>

                <option value="Pharmacy">
                  Pharmacy
                </option>

                <option value="Technical Support">
                  Technical Support
                </option>

                <option value="Other">
                  Other
                </option>

              </select>


              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe the support required"
                required
              />


              <label>
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
              >

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

                <option value="Critical">
                  Critical
                </option>

              </select>


              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Resolved">
                  Resolved
                </option>

              </select>


              <button type="submit">
                Submit Request
              </button>

            </form>

          </div>

        )}


        {/* REQUEST LIST */}

        <div className="requests-section">

          <div className="section-header">

            <h2>
              Support Requests
            </h2>

            <span>
              {requests.length} Requests
            </span>

          </div>


          {requests.length === 0 ? (

            <div className="empty">

              <h3>
                No support requests found
              </h3>

              <p>
                Create a new request to get started.
              </p>

            </div>

          ) : (

            <div className="request-list">

              {requests.map((request) => (

                <div
                  className="request-card"
                  key={request.id}
                >

                  <div className="request-header">

                    <h3>
                      {request.request_type}
                    </h3>

                    <span className="status">
                      {request.status}
                    </span>

                  </div>


                  <p>
                    <strong>
                      Patient:
                    </strong>{" "}
                    {request.patient_name}
                  </p>


                  <p>
                    <strong>
                      Patient ID:
                    </strong>{" "}
                    {request.patient_id}
                  </p>


                  <p>
                    <strong>
                      Department:
                    </strong>{" "}
                    {request.department}
                  </p>


                  <p>
                    <strong>
                      Priority:
                    </strong>{" "}
                    {request.priority}
                  </p>


                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {request.description}
                  </p>


                  <p>
                    <strong>
                      Assigned To:
                    </strong>{" "}
                    {request.assigned_to ||
                      "Not assigned"}
                  </p>


                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteRequest(request.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>

  );
}

export default App;