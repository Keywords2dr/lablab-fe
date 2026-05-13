import React, { useState } from 'react';
import { 
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider 
} from '@mui/material';
import { MoreVert as MoreVertIcon, Edit, Lock, LockOpen, Key } from '@mui/icons-material';

const UserActionMenu = ({ user, onEdit, onToggleActive, onResetPassword }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClick} size="small">
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ sx: { minWidth: 200 } }}
            >
                <MenuItem onClick={() => { handleClose(); onEdit(user); }}>
                    <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                    <ListItemText>Chỉnh sửa</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => { handleClose(); onToggleActive(user.userId); }}>
                    <ListItemIcon>
                        {user.isActive 
                            ? <Lock fontSize="small" color="error" /> 
                            : <LockOpen fontSize="small" color="success" />
                        }
                    </ListItemIcon>
                    <ListItemText>
                        {user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    </ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => { handleClose(); onResetPassword(user.userId); }}>
                    <ListItemIcon><Key fontSize="small" /></ListItemIcon>
                    <ListItemText>Reset mật khẩu</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserActionMenu;