import axios from "axios";
import { createContext, useEffect, useState } from "react";

const EmployeeContext = createContext();

const EmployeeProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")
  );
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(() => localStorage.getItem("id"));
  const [tickets, setTickets] = useState([]);
  const [singleTicket, setSingleTicket] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [limitNotification, setLimitNotification] = useState([]);
  const [notificationCount, setNotificationCount] = useState();
  const [grievance, setGrievance] = useState([]);
  const [singleGrievance, setSingleGrievance] = useState([]);
  const [performance, setPerformance] = useState([{}]);
  const [grievancePerformance, setGrievancePerformance] = useState([{}]);
  const [uniqueRecipients, setUniqueRecipients] = useState([{}]);
  let [overallPerformance, setOverallPerformance] = useState([
    {
      total: "",
      close: "",
      open: "",
    },
  ]);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const loginEmployee = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/login`,
        {
          email,
          password,
        }
      );

      const { token, employee, id } = response.data;

      if (response.data.message === "Employee logged in successfully") {
        setToken(token);
        localStorage.setItem("token", token);
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

  const logoutEmployee = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setError(null);
    setToken(null);
    setIsAuthenticated(false);
    setId(null);
    setEmployee([]);
    setPerformance([{}]);
  };

  const getEmployee = async (id) => {
    if (!id) return;
    try {
      await axios
        .get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/getSingleEmployee/${id}`,
          authHeaders
        )
        .then((res) => {
          setEmployee(res.data.employee);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

  const getAllSchemes = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/scheme/getAllSchemes`, authHeaders)
        .then((res) => {
          const filteredTickets = res.data.schemes.filter(
            (ticket) => ticket.assigned_to._id === id
          );
          setTickets(filteredTickets);
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

  const getNotification = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/getEmployeeNotifications`,
        authHeaders
      );
      const filteredNotifications = res.data.notifications.filter(
        (notification) => notification.recipientId._id === id
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

  const getLimitNotifications = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/getLimitEmployeeNotifications`,
        { id },
        authHeaders
      );

      setLimitNotification(res.data.notifications);

      const filterNotificationCount = res.data.notifications.filter(
        (notification) =>
          notification.recipientId._id === id && !notification.read
      );
      setNotificationCount(filterNotificationCount.length);
    } catch (error) {
      // Error handling without console.log in production
    }
  }

  const markAsRead = async (notificationId) => {
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

  const employeePerformance = async (id) => {
    if (!id) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/employeePerformance`,
        { id },
        authHeaders
      );
      setPerformance(res.data.data);
    } catch (error) {
      // Error handling
    }
  };

  const getAllGrievance = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/grievances/getAllGrievance`, authHeaders)
        .then((res) => {
          const filteredGrievance = res.data.grievance.filter(
            (grievance) => grievance.assigned_to._id === id
          );
          setGrievance(filteredGrievance);
        });
    } catch (error) {
      // Error handling without console.log in production
    }
  };

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

  const employeeGreivancePerformance = async (id) => {
    if (!id) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/employeeGrievancePerformance`,
        { id },
        authHeaders
      );
      setGrievancePerformance(res.data.data);
    } catch (error) {
      // Error handling
    }
  };

  const overallEmployeePerformance = async () => {
    const total = (performance[0]?.total || 0) + (grievancePerformance[0]?.total || 0);
    const close = (performance[0]?.close || 0) + (grievancePerformance[0]?.close || 0);
    const open = (performance[0]?.open || 0) + (grievancePerformance[0]?.open || 0);
    setOverallPerformance([
      {
        total: total,
        close: close,
        open: open,
      },
    ]);
  };

  const getUniqueRecipientsWithLatestMessage = async () => {
    if (!id) return;
    const sender = id;
    const senderType = "employee";
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/messages/getUniqueRecipientsWithLatestMessageForEmployee`,
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
      getEmployee(id);
      getAllSchemes();
      getNotification();
      getAllGrievance();
      employeePerformance(id);
      employeeGreivancePerformance(id);
      getLimitNotifications();
      getUniqueRecipientsWithLatestMessage();
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (performance[0]?.total !== undefined && grievancePerformance[0]?.total !== undefined) {
      overallEmployeePerformance();
    }
  }, [performance, grievancePerformance]);
 // Dependencies include isAuthenticated and id

  return (
    <EmployeeContext.Provider
      value={{
        loginEmployee,
        getEmployee,
        error,
        token,
        isAuthenticated,
        employee,
        loading,
        logoutEmployee,
        id,
        tickets,
        singleTicket,
        getSingleAppliedScheme,
        getAllSchemes,
        getNotification,
        notifications,
        notificationCount,
        markAsRead,
        employeePerformance,
        performance,
        getAllGrievance,
        grievance,
        getSingleGrievance,
        singleGrievance,
        grievancePerformance,
        employeeGreivancePerformance,
        overallEmployeePerformance,
        overallPerformance,
        getLimitNotifications,
        limitNotification,
        getUniqueRecipientsWithLatestMessage,
        uniqueRecipients
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export { EmployeeContext, EmployeeProvider };
