import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@mui/material";
import { getTasks } from "../../api/tasksApi";
import { useTaskStore } from "../../store/useTaskStore";
import TaskCard from "../TaskCard/TaskCard";
import TaskModal from "../TaskModal/TaskModal";
import styles from "../../styles/Board.module.css";

export default function Column({ column }) {
  // Pagination state
  const [page, setPage] = useState(1);

  // Modal state for adding task
  const [modalOpen, setModalOpen] = useState(false);

  // Global search state from store
  const { search } = useTaskStore();

  // Make column droppable for drag and drop
  const { setNodeRef } = useDroppable({ id: column });

  // Fetch tasks using React Query
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", column, page, search],

    // Fetch tasks with filters and pagination
    queryFn: async () => {
      const res = await getTasks({
        column,
        page,
        limit: 5,
        search,
      });

      return {
        tasks: Array.isArray(res?.tasks) ? res.tasks : [],
        total: res?.total ?? 0,
      };
    },

    // Keep previous page data while loading new page (better UX)
    keepPreviousData: true,
  });

  // Extract tasks and total count safely
  const tasks = data?.tasks || [];
  const total = data?.total || 0;

  // Column bullet color mapping
  const getBulletColor = () => {
    const colors = {
      backlog: "#1e40af",
      in_progress: "#ea580c",
      review: "#7c3aed",
      done: "#16a34a",
    };

    return colors[column] || "#666";
  };

  // Column title formatting
  const getColumnTitle = () =>
    column === "backlog"
      ? "TO DO"
      : column.replace("_", " ").toUpperCase();

  // Loading state
  if (isLoading) return <div className={styles.column}>Loading...</div>;

  return (
    <div
      className={styles.column}
      ref={setNodeRef}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "400px",
      }}
    >
      {/* Column header */}
      <div className={styles.columnTitle}>
        <span
          style={{
            display: "inline-block",
            width: "15px",
            height: "15px",
            borderRadius: "50%",
            backgroundColor: getBulletColor(),
            marginRight: "10px",
            verticalAlign: "middle",
          }}
        ></span>

        {getColumnTitle()}
      </div>

      {/* Tasks list */}
<div className={styles.tasksContainer} style={{ flexGrow: 1 }}>
  {tasks.length > 0 ? (
    tasks.map((task) => (
      <TaskCard key={task.id} task={task} />
    ))
  ) : (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        color: "#888",
        border: "1px dashed #ccc",
        borderRadius: "8px",
      }}
    >
      No tasks found
    </div>
  )}

  {/* Add task button - always visible */}
  <Button
    variant="contained"
    size="small"
    onClick={() => setModalOpen(true)}
    sx={{
      marginTop: 2,
      width: "100%",
      backgroundColor: "transparent",
      color: "inherit",
      border: "1px solid #ccc",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.05)",
        boxShadow: "none",
      },
    }}
  >
    + Add Task
  </Button>
</div>


      {/* Pagination controls */}
      <div
        style={{
          marginTop: "auto",
          textAlign: "center",
          paddingTop: "10px",
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>{page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * 5 >= total}
        >
          Next
        </button>
      </div>

      {/* Task modal for creating task */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        column={column}
      />
    </div>
  );
}
