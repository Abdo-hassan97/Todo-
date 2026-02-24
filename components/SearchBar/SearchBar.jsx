import TextField from "@mui/material/TextField";
import { useTaskStore } from "../../store/useTaskStore";

export default function SearchBar() {
  const { search, setSearch } = useTaskStore();

  return (
    <TextField
      size="small"
      label="Search tasks..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{ width: "100%" }}
    />
  );
}
