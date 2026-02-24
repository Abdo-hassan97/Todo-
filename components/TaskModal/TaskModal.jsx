import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "../../api/tasksApi";

export default function TaskModal({ open, onClose, task, column }) {
  const queryClient = useQueryClient();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // Snackbar notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /**
   * Reset or populate form when modal opens
   * If editing task → fill fields with task data
   * If creating task → reset form fields
   */
  useEffect(() => {
    if (!open) return;

    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  }, [open, task]);

  /**
   * Mutation for creating task
   */
  const createMutation = useMutation({
    mutationFn: (data) =>
      createTask({
        ...data,
        column,
      }),

    onSuccess: () => {
      // Refresh tasks list after creation
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      setSnackbarMessage("Task created successfully!");
      setSnackbarOpen(true);

      // Close modal shortly after success
      setTimeout(() => onClose(), 300);
    },
  });

  /**
   * Mutation for updating task
   */
  const updateMutation = useMutation({
    mutationFn: (data) => updateTask(task.id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      setSnackbarMessage("Task updated successfully!");
      setSnackbarOpen(true);

      setTimeout(() => onClose(), 300);
    },
  });

  /**
   * Form submit handler
   */
  const handleSubmit = () => {
    // Simple validation
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const data = {
      title,
      description,
      priority,
    };

    // Decide whether creating or updating task
    if (task) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Modal Title */}
      <DialogTitle>
        {task ? "Edit Task" : "Add New Task"}
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: 0,
        }}
      >
        {/* Title Input */}
        <TextField
          autoFocus
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{ mt: 1 }}
        />

        {/* Description Input */}
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
        />

        {/* Priority Selector */}
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {task ? "Update" : "Add"}
        </Button>
      </DialogActions>

      {/* Success Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
