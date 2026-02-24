import axios from "axios";

const API = "http://localhost:4000/tasks";

/**
 * Get tasks with:
 * - Column filtering (like backlog, todo, done ...)
 * - Search filtering (title or description)
 * - Pagination (client-side because json-server pagination is unreliable)
 */
export const getTasks = async ({
  column,
  page = 1,
  limit = 5,
  search = "",
}) => {
  // Fetch all tasks first because backend pagination/filtering may not work reliably
  const { data } = await axios.get(API);

  // Ensure data is always an array to avoid runtime errors
  let filtered = Array.isArray(data) ? data : [];

  // Filter tasks by column if column filter is provided
  if (column) {
    filtered = filtered.filter((task) => task.column === column);
  }

  // Filter tasks by search text (case insensitive search)
  if (search) {
    const searchLower = search.toLowerCase();

    filtered = filtered.filter(
      (task) =>
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
    );
  }

  // Total tasks after filtering (useful for pagination UI)
  const total = filtered.length;

  // Calculate pagination slice indexes
  const start = (page - 1) * limit;

  // Return only the tasks inside the current page
  const tasks = filtered.slice(start, start + limit);

  return {
    tasks,
    total,
  };
};

/**
 * Create a new task
 */
export const createTask = async (task) => {
  const { data } = await axios.post(API, task);
  return data;
};

/**
 * Update task partially using PATCH
 * Only send changed fields instead of full object
 */
export const updateTask = async (id, updated) => {
  const { data } = await axios.patch(`${API}/${id}`, updated);
  return data;
};

/**
 * Delete task by ID
 */
export const deleteTask = async (id) => {
  await axios.delete(`${API}/${id}`);
};
