// src/pages/admin/users/UserManagementPage.jsx
import React, { useState } from 'react';
import {
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import { Add as AddIcon, PeopleAlt } from '@mui/icons-material';

import UserTable from './components/UserTable';
import UserFormModal from './components/UserFormModal';
import { useUsers } from './hooks/useUsers';
import './UserManagementPage.css';

const UserManagementPage = () => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({
        keyword: '',
        role: '',
        isActive: ''
    });

    const { users, loading } = useUsers();

    const handleOpenCreate = () => {
        setSelectedUser(null);
        setOpenModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenModal(true);
    };

    return (
        <div className="admin-users-page">
            {/* Banner Header */}
            <div className="users-banner">
                <div className="banner-left">
                    <div className="banner-icon">
                        <PeopleAlt sx={{ fontSize: 40, color: 'white' }} />
                    </div>
                    <div>
                        <Typography variant="h4" className="banner-title">
                            Quản lý Người dùng
                        </Typography>
                        <Typography variant="body1" className="banner-desc">
                            Thêm, chỉnh sửa và quản lý tài khoản người dùng trong hệ thống
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <div className="filters-row">
                    <TextField
                        placeholder="Tìm tên người dùng, email..."
                        variant="outlined"
                        size="small"
                        className="search-input"
                        value={filters.keyword}
                        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    />

                    <FormControl size="small" className="filter-select">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={filters.role}
                            label="Role"
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="USER">USER</MenuItem>
                            <MenuItem value="STUDENT">STUDENT</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" className="filter-select">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={filters.isActive}
                            label="Trạng thái"
                            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="true">Hoạt động</MenuItem>
                            <MenuItem value="false">Đã khóa</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    className="create-new-button"
                >
                    Tạo tài khoản mới
                </Button>
            </div>

            {/* Table Area */}
            <div className="table-container">
                <UserTable filters={filters} onEdit={handleEdit} />
            </div>

            <UserFormModal 
                open={openModal} 
                onClose={() => setOpenModal(false)} 
                user={selectedUser}
            />
        </div>
    );
};

export default UserManagementPage;