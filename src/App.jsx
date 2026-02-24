import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Board from "../components/Board/Board";
import SearchBar from "../components/SearchBar/SearchBar";
import { getTasks } from "../api/tasksApi";
import logo from "./assets/Windows_logo_-_2021.svg.png";

function App() {
  const queryClient = useQueryClient();
  const [totalTasks, setTotalTasks] = useState(0);

  // Fetch all tasks to get total count
  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await getTasks({ page: 1, limit: 1000 });
      return res;
    },
  });

  // Clear all cached queries on app load
  useEffect(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  // Update total tasks count
  useEffect(() => {
    if (data?.total) {
      setTotalTasks(data.total);
    }
  }, [data]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {/* Left → Logo */}
        <div style={{ width: "60px" }}>
          <img
            src={logo}
            alt="logo"
            style={{
              width: "70%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Center → Title + Tasks Count */}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>Kanban Bord</h2>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "0.9em",
              color: "#666",
            }}
          >
            Total Tasks: {totalTasks}
          </p>
        </div>

        {/* Right → Search Bar */}
        <div style={{ width: "300px" }}>
          <SearchBar />
        </div>
      </div>

      <hr
        style={{
          margin: "0",
          border: "none",
          borderTop: "1px solid #ddd",
        }}
      />

      <Board />
    </div>
  );
}

export default App;
