import React, { useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, CircularProgress, Avatar, Pagination, PaginationItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import UserStatusBadge from './UserStatusBadge';
import UserActionMenu from './UserActionMenu';
import { useUsers } from '../hooks/useUsers';
import './UserTable.css'; 

const UserTable = ({ filters, onEdit }) => {
    // Lấy các state và function từ hook useUsers
    const {
        users, loading, total, page, rowsPerPage,
        setPage, fetchUsers, toggleActive, resetPassword
    } = useUsers();

    // Gọi lại dữ liệu khi filter hoặc trang thay đổi
    useEffect(() => {
        fetchUsers(filters);
    }, [fetchUsers, filters, page]); // Thêm page vào dependency để tự load khi chuyển trang

    const totalPages = Math.ceil(total / rowsPerPage) || 1;

    const handlePageChange = (event, newPage) => {
        // MUI Pagination dùng base 1 (trang 1, 2, 3), hook dùng base 0 (index 0, 1, 2)
        setPage(newPage - 1); 
    };

    const getRoleClass = (role) => {
        const r = role?.toLowerCase();
        if (r === 'admin') return 'role-badge admin';
        if (r === 'student') return 'role-badge student';
        if (r === 'staff') return 'role-badge staff';
        return 'role-badge';
    };

    return (
        <div className="user-table-wrapper">
            {/* PHẦN BẢNG DỮ LIỆU */}
            <Paper className="user-table-paper" elevation={0}>
                <TableContainer className="user-table-container">
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
                                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
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
                                                <Avatar className="user-avatar" sx={{ bgcolor: 'primary.main' }}>
                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                                </Avatar>
                                                <div className="user-text">
                                                    <span className="user-name">{user.fullName || 'N/A'}</span>
                                                    <span className="user-email">{user.email || 'Hệ thống tự gán'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {user.username}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <span className={getRoleClass(user.role)}>
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
                                                onToggleActive={toggleActive}
                                                // Function resetPassword này đã có logic window.prompt trong hook useUsers.js
                                                onResetPassword={(id) => resetPassword(id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* PHẦN PHÂN TRANG */}
            <div className="separate-pagination-card">
                <div className="pagination-left-info">
                    Trang <b>{page + 1}</b> / {totalPages} (Tổng {total} người dùng)
                </div>
                
                <Pagination 
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    variant="outlined" 
                    shape="rounded"
                    color="primary"
                    className="custom-pagination-buttons"
                    renderItem={(item) => (
                        <PaginationItem
                            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                            {...item}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export default UserTable;