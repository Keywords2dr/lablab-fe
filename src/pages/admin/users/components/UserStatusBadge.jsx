import React from 'react';
import { Chip } from '@mui/material';

const UserStatusBadge = ({ isActive }) => {
    return (
        <Chip
            label={isActive ? "Hoạt động" : "Đã khóa"}
            color={isActive ? "success" : "error"}
            size="small"
            variant="filled"
        />
    );
};

export default UserStatusBadge;