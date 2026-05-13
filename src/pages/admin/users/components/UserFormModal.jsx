import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Alert,
    Grid, 
} from '@mui/material';
import { useUsers } from '../hooks/useUsers';

const UserFormModal = ({ open, onClose, user }) => {
    const { createUser, updateUser } = useUsers();
    const isEditMode = !!user;

    const initialFormState = {
        username: '',
        password: '',
        role: '', 
        isActive: true,
        fullName: '',
        email: '', 
        faculty: '',
        major: '',
        department: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditMode && user) {
                setFormData({
                    username: user.username || '',
                    password: '',
                    role: user.role || '',
                    isActive: user.isActive !== undefined ? user.isActive : true,
                    fullName: user.fullName || '',
                    email: user.email || '', 
                    faculty: user.faculty || '',
                    major: user.major || '',
                    department: user.department || '',
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({});
        }
    }, [open, user, isEditMode]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username?.trim()) newErrors.username = "Username không được để trống";
        if (!isEditMode && (!formData.password || formData.password.length < 6)) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        if (!formData.fullName?.trim()) newErrors.fullName = "Họ và tên không được để trống";
        if (!formData.role) newErrors.role = "Vui lòng chọn Role";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (isEditMode) delete payload.password;
            
            let success = isEditMode 
                ? await updateUser(user.userId, payload) 
                : await createUser(payload);

            if (success) onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', color: '#1e293b' }}>
                {isEditMode ? "Chỉnh sửa người dùng" : "Tạo tài khoản mới"}
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        Thông tin hệ thống
                    </Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={isEditMode ? 12 : 6}>
                            <TextField
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                helperText={errors.username}
                                fullWidth
                                required
                                disabled={isEditMode}
                            />
                        </Grid>
                        {!isEditMode && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} sm={8}> 
                            <FormControl 
                                fullWidth 
                                required 
                                error={!!errors.role}
                            >
                                <InputLabel id="role-label" shrink>Quyền hạn (Role)</InputLabel>
                                <Select
                                    labelId="role-label"
                                    name="role"
                                    value={formData.role || ""} 
                                    label="Quyền hạn (Role)"
                                    onChange={handleChange}
                                    displayEmpty
                                    notched 
                                    sx={{ 
                                        minWidth: '100%',
                                        bgcolor: 'white'
                                    }}
                                >
                                    {/* Loại bỏ thẻ em in nghiêng và đổi Staff thành Teacher */}
                                    <MenuItem value="" disabled>
                                        -- Chọn quyền hạn --
                                    </MenuItem>
                                    <MenuItem value="ADMIN">ADMIN (Quản trị viên)</MenuItem>
                                    <MenuItem value="TEACHER">TEACHER (Giảng viên)</MenuItem>
                                    <MenuItem value="STUDENT">STUDENT (Sinh viên)</MenuItem>
                                </Select>
                                {errors.role && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {errors.role}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel shrink>Trạng thái</InputLabel>
                                <Select
                                    name="isActive"
                                    value={formData.isActive}
                                    label="Trạng thái"
                                    onChange={handleChange}
                                    notched
                                >
                                    <MenuItem value={true}>Hoạt động</MenuItem>
                                    <MenuItem value={false}>Đã khóa</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 700, mt: 4, mb: 2 }}>
                        Thông tin cá nhân & Chuyên môn
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={isEditMode ? 6 : 12}>
                            <TextField
                                label="Họ và tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                error={!!errors.fullName}
                                helperText={errors.fullName}
                                fullWidth
                                required
                            />
                        </Grid>
                        
                        {isEditMode && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email (Hệ thống)"
                                    name="email"
                                    value={formData.email}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    sx={{ bgcolor: '#f1f5f9' }}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} sm={4}>
                            <TextField label="Khoa" name="faculty" value={formData.faculty} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Bộ môn" name="department" value={formData.department} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Chuyên ngành" name="major" value={formData.major} onChange={handleChange} fullWidth />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} disabled={submitting} color="inherit" sx={{ fontWeight: 600 }}>
                    Đóng
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    sx={{ px: 4, fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
                >
                    {submitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo tài khoản"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;