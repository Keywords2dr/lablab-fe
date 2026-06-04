import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { USER_ROLES, USER_STATUS_OPTIONS } from "../constants/userConstants";

export default function UserFilterBar({ filters, onFilterChange, onCreateNew }) {
  return (
    <div className="action-bar">
      <div className="filters-row">
        <TextField
          placeholder="Tìm theo tên, username, email..."
          variant="outlined"
          size="small"
          className="search-input"
          value={filters.keyword}
          onChange={onFilterChange("keyword")}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" className="filter-select">
          <InputLabel>Vai trò</InputLabel>
          <Select
            value={filters.role}
            label="Vai trò"
            onChange={onFilterChange("role")}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {USER_ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className="filter-select">
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filters.isActive}
            label="Trạng thái"
            onChange={onFilterChange("isActive")}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {USER_STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateNew}
        className="create-new-button"
      >
        Tạo tài khoản mới
      </Button>
    </div>
  );
}
