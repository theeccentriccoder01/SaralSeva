import axios from "axios";
import { createContext, useEffect, useState } from "react";

const AdminContext = createContext();

const AdminProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [singleEmployee, setSingleEmployee] = useState();
  const [scheme, setScheme] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem("tokenAdmin"));
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("tokenAdmin")
  );
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(() => localStorage.getItem("id"));
  const [tickets, setTickets] = useState([]);
  const [singleTicket, setSingleTicket] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [limitNotification, setLimitNotification] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [grievance, setGrievance] = useState([]);
  const [singleGrievance, setSingleGrievance] = useState([]);
  const [uniqueRecipients, setUniqueRecipients] = useState([{}]);
  const [totalSchemeProgress, setTotalProgress] = useState(0);
  const [totalApprovedScheme, setTotalApprovedScheme] = useState(0);
  const [totalPendingScheme, setTotalPendingScheme] = useState(0);
  const [totalRejectedScheme, setTotalRejectedScheme] = useState(0);
  const [totalGrievance, setTotalGrievance] = useState(0);
  const [totalOpenGrievance, setOpenGrievance] = useState(0);
  const [totalCloseGrievance, setCloseGrievance] = useState(0);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const login = async (formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/loginAdmin`,
        formData
      );

      const { token, admin, id } = response.data;

      if (response.data.success) {
        setToken(token);
        localStorage.setItem("tokenAdmin", token);
        setIsAuthenticated(true);
        setError(null);
        localStorage.setItem("id", id);
        setId(id);
        return true;
      } else {
        setError(response.data.message);
        setIsAuthenticated(false);
        setToken(null);
        setId(null);
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      setError(errorMessage);
      setIsAuthenticated(false);
      setToken(null);
      setId(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("id");
    setError(null);
    setToken(null);
    setIsAuthenticated(false);
    setId(null);
  };

  const getSingleAdmin = async (adminId) => {
    if (!adminId) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/getSingleAdmin/${adminId}`,
        authHeaders
      );
      setAdmin(res.data.admin);
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getEmployees = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/getEmployees`,
        authHeaders
      );
      setEmployees(res.data.employees);
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getSingleEmployee = async (empId) => {
    if (!empId) return;
    try {
      await axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/getSingleEmployee/${empId}`, authHeaders)
        .then((res) => {
          setSingleEmployee(res.data.employee);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const listSchemes = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/schemes/list_scheme`
      );
      if (res.data && Array.isArray(res.data.products)) {
        setScheme(res.data.products);
      }
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  useEffect(() => {
    listSchemes();
  }, []);

  const getAllSchemes = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/scheme/getAllSchemes`, authHeaders)
        .then((res) => {
          setTickets(res.data.schemes);
          let approved = 0;
          let pending = 0;
          let rejected = 0;
          setTotalProgress(res.data.schemes.length);
          res.data.schemes.forEach((ticket) => {
            if (ticket.final_status === "approved") {
              approved++;
            } else if (ticket.final_status === "pending") {
              pending++;
            } else if (ticket.final_status === "rejected") {
              rejected++;
            }
          });
          setTotalApprovedScheme(approved);
          setTotalPendingScheme(pending);
          setTotalRejectedScheme(rejected);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getSingleAppliedScheme = async (schemeId) => {
    if (!schemeId) return;
    try {
      await axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/scheme/getSingleScheme/${schemeId}`, authHeaders)
        .then((res) => {
          setSingleTicket(res.data.appliedScheme);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getLimitNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/getLimitAdminNotifications`,
        authHeaders
      );
      setLimitNotification(res.data.notifications);
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getNotification = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/getAdminNotifications`,
        {},
        authHeaders
      );
      const filteredNotifications = res.data?.notifications?.filter(
        (notification) => notification?.recipientId?._id === id
      );
      setNotifications(filteredNotifications);
      const filterNotificationCount = res.data.notifications.filter(
        (notification) =>
          notification.recipientId._id === id && !notification.read
      );
      setNotificationCount(filterNotificationCount.length);
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId) return;
    try {
      await axios
        .post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/markAsRead`, {
          notificationId,
        }, authHeaders)
        .then((res) => {
          getNotification();
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getAllGrievance = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/grievances/getAllGrievance`,
        authHeaders
      );
      setGrievance(res.data.grievance);
      setTotalGrievance(res.data.grievance.length);
      let open = 0;
      let closed = 0;
      res.data.grievance.forEach((grievance) => {
        if (grievance.status === "pending") {
          open++;
        } else {
          closed++;
        }
      });
      setOpenGrievance(open);
      setCloseGrievance(closed);
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const progress = () => {
    let total = totalGrievance + totalSchemeProgress;
    let close = totalCloseGrievance + totalApprovedScheme + totalRejectedScheme; 
    let open = totalOpenGrievance + totalPendingScheme;
    let progressVal = total > 0 ? ((close / total) * 100).toFixed(2) : 0;
    let data = [{
      total: total,
      close: close,
      open: open,
      progress: progressVal
    }]
    return data;
  }

  const getSingleGrievance = async (grievanceId) => {
    if (!grievanceId) return;
    try {
      await axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/grievances/getSingleGrievance/${grievanceId}`, authHeaders)
        .then((res) => {
          setSingleGrievance(res.data.grievance);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getUniqueRecipientsWithLatestMessage = async () => {
    if (!id) return;
    const sender = id;
    const senderType = "Admin";
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/messages/getUniqueRecipientsWithLatestMessage`,
          { sender, senderType },
          authHeaders
        )
        .then((res) => {
          setUniqueRecipients(res.data.recipients);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      getSingleAdmin(id);
      getAllSchemes();
      getEmployees();
      getNotification();
      getLimitNotifications();
      getAllGrievance();
      getUniqueRecipientsWithLatestMessage();
    }
  }, [isAuthenticated, id, token]);
 // Dependencies include isAuthenticated and id

  return (
    <AdminContext.Provider
      value={{
        login,
        isAuthenticated,
        token,
        error,
        id,
        employees,
        scheme,
        tickets,
        singleTicket,
        getAllSchemes,
        getSingleAppliedScheme,
        admin,
        notifications,
        notificationCount,
        markAsRead,
        limitNotification,
        getLimitNotifications,
        getNotification,
        grievance,
        getAllGrievance,
        singleGrievance,
        getSingleGrievance,
        singleEmployee,
        getSingleEmployee,
        getUniqueRecipientsWithLatestMessage,
        uniqueRecipients,
        logout,
        totalApprovedScheme,
        totalPendingScheme,
        totalRejectedScheme,
        totalSchemeProgress,
        progress,
        totalOpenGrievance,
        totalCloseGrievance
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext, AdminProvider };
