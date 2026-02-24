import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IconButton, Box, Snackbar, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../../styles/Board.module.css";
import TaskModal from "../TaskModal/TaskModal";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "../../api/tasksApi";

export default function TaskCard({ task }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

 
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSnackbarOpen(true);
    },
  });

  const handleDelete = (e) => {
    e.stopPropagation(); 

     deleteMutation.mutate(task.id);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={styles.taskCard}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, wordBreak: "break-word" }}>{task.title}</h4>
            <p style={{ marginTop: 6, fontSize: "0.9em", color: "#666", wordBreak: "break-word" }}>
              {task.description}
            </p>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, ml: 1, flexShrink: 0 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setModalOpen(true); }} sx={{ padding: "4px" }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} sx={{ padding: "4px" }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ marginTop: 2 }}>
          <span style={{
            display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8em",
            fontWeight: "500", textTransform: "capitalize",
            color: task.priority === "high" ? "#dc2626" : task.priority === "medium" ? "#ea580c" : "#6b7280",
            backgroundColor: task.priority === "high" ? "#fee2e2" : task.priority === "medium" ? "#ffedd5" : "#f3f4f6",
          }}>
            {task.priority || "medium"}
          </span>
        </Box>
      </div>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} task={task} />
      
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success">Task deleted successfully!</Alert>
      </Snackbar>
    </>
  );
}