import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../../api/tasksApi";
import styles from "../../styles/Board.module.css";
import Column from "../Column/Column";
import TaskCard from "../TaskCard/TaskCard";

const columns = ["backlog", "in_progress", "review", "done"];

export default function Board() {
  const queryClient = useQueryClient();

  // Store task being dragged to show preview overlay
  const [activeTask, setActiveTask] = useState(null);

  // Configure drag sensor
  // distance constraint prevents accidental drag when clicking
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Mutation for updating task column when drag ends
  const mutation = useMutation({
    mutationFn: ({ id, column }) => updateTask(id, { column }),

    // Optimistic update preparation (currently only storing previous data)
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Save previous tasks state in case rollback is needed
      const previousTasks = queryClient.getQueryData(["tasks"]);

      return { previousTasks };
    },

    // Refresh tasks after mutation finishes (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Triggered when drag starts
  const handleDragStart = (event) => {
    // Store dragged task data for overlay preview
    setActiveTask(event.active.data.current?.task || null);
  };

  // Triggered when drag ends
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Clear overlay preview
    setActiveTask(null);

    // If dropped outside any column → ignore
    if (!over) return;

    // Update task column in backend
    mutation.mutate({
      id: active.id,
      column: over.id,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Board container */}
      <div className={styles.board}>
        {columns.map((col) => (
          <Column key={col} column={col} />
        ))}
      </div>

      {/* Drag preview overlay */}
      <DragOverlay>
        {activeTask ? (
          <div style={{ width: "280px", opacity: 0.8 }}>
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
