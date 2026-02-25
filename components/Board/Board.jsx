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
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  /**
   * 🔥 Optimistic Mutation
   */
  const mutation = useMutation({
    mutationFn: ({ id, column }) => updateTask(id, { column }),

    onMutate: async ({ id, column }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["tasks"],
      });

      // Optimistically update every cached page
      previousQueries.forEach(([queryKey, data]) => {
        if (!data?.tasks) return;

        const updatedTasks = data.tasks.map((task) =>
          task.id === id ? { ...task, column } : task
        );

        queryClient.setQueryData(queryKey, {
          ...data,
          tasks: updatedTasks,
        });
      });

      return { previousQueries };
    },

    onError: (err, variables, context) => {
      // Rollback if request fails
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleDragStart = (event) => {
    setActiveTask(event.active.data.current?.task || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;
    if (active.data.current.task.column === over.id) return;

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
      <div className={styles.board}>
        {columns.map((col) => (
          <Column key={col} column={col} />
        ))}
      </div>

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
