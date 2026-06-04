import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Pagination,
  PaginationItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import UserStatusBadge from "./UserStatusBadge";
import UserActionMenu from "./UserActionMenu";


const ROLE_CLASS = {
  admin: "role-badge admin",
  student: "role-badge student",
  teacher: "role-badge staff",
};

const UserTable = ({
  users,
  loading,
  total,
  totalPages,
  page,
  onPageChange,
  onEdit,
  onToggleActive,
  onResetPassword,
}) => {
  return (
    <div className="user-table-wrapper">
      <Paper className="user-table-paper" elevation={0}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead className="table-header">
              <TableRow>
                <TableCell>NGƯỜI DÙNG</TableCell>
                <TableCell>USERNAME</TableCell>
                <TableCell>VAI TRÒ</TableCell>
                <TableCell>TRẠNG THÁI</TableCell>
                <TableCell align="center">THAO TÁC</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={32} thickness={5} />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "text.secondary" }}
                    >
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không tìm thấy người dùng nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.userId} className="user-row">
                    <TableCell>
                      <div className="user-info-cell">
                        <Avatar className="user-avatar">
                          {user.fullName?.charAt(0).toUpperCase() ?? "?"}
                        </Avatar>
                        <div>
                          <span className="user-name">
                            {user.fullName || "N/A"}
                          </span>
                          <span className="user-email">
                            {user.email || "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="username-text">{user.username}</span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={
                          ROLE_CLASS[user.role?.toLowerCase()] ?? "role-badge"
                        }
                      >
                        {user.role}
                      </span>
                    </TableCell>

                    <TableCell>
                      <UserStatusBadge isActive={user.isActive} />
                    </TableCell>

                    <TableCell align="center">
                      <UserActionMenu
                        user={user}
                        onEdit={onEdit}
                        onToggleActive={onToggleActive}
                        onResetPassword={onResetPassword}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Phân trang */}
      <div className="separate-pagination-card">
        <div className="pagination-left-info">
          Trang <b>{page + 1}</b> / {totalPages} &nbsp;·&nbsp; Tổng {total}{" "}
          người dùng
        </div>

        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(_, newPage) => onPageChange(newPage - 1)}
          variant="outlined"
          shape="rounded"
          color="primary"
          className="custom-pagination-buttons"
          renderItem={(itemProps) => {
            const { item: _item, ...rest } = itemProps;
            return (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...rest}
              />
            );
          }}
        />
      </div>
    </div>
  );
};

export default UserTable;
