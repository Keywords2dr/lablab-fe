import React, { useState, useEffect } from "react";
import {
  Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Typography, Box,
  Chip, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, FormControl, InputLabel,
  Pagination,
} from "@mui/material";

import {
  Add, Edit, Delete, Search, Inventory as InventoryIcon,
  Save,
} from "@mui/icons-material";

import { toast } from "react-toastify";
import "./MaterialManagement.css";

export default function MaterialManagement() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Form
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "Hóa chất",
    unit: "",
    quantity: 0,
    minStock: 0,
  });

  // Dữ liệu mẫu
  useEffect(() => {
    setMaterials([
      { id: 1, code: "HC001", name: "Axit Sunfuric H2SO4 98%", type: "Hóa chất", unit: "Chai", quantity: 45, minStock: 20 },
      { id: 2, code: "HC002", name: "Natri Clorua (NaCl)", type: "Hóa chất", unit: "kg", quantity: 8, minStock: 15 },
      { id: 3, code: "HC003", name: "Ethanol 96%", type: "Hóa chất", unit: "Lít", quantity: 120, minStock: 30 },
      { id: 4, code: "TB001", name: "Ống nghiệm thủy tinh 15ml", type: "Thiết bị", unit: "Cái", quantity: 85, minStock: 50 },
    ]);
  }, []);

  const filteredMaterials = materials
    .filter(item => 
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "all" || item.type === filterType)
    );

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset form
  const resetForm = () => {
    setFormData({ code: "", name: "", type: "Hóa chất", unit: "", quantity: 0, minStock: 0 });
    setEditingItem(null);
  };

  // Mở form thêm
  const handleOpenAdd = () => {
    resetForm();
    setOpenForm(true);
  };

  // Mở form sửa
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setOpenForm(true);
  };

  // Lưu (Thêm / Sửa)
  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.unit) {
      toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (editingItem) {
      // Sửa
      setMaterials(materials.map(item => 
        item.id === editingItem.id ? { ...formData, id: item.id } : item
      ));
      toast.success("Cập nhật hóa chất thành công!");
    } else {
      // Thêm mới
      const newItem = {
        ...formData,
        id: Date.now(),
      };
      setMaterials([...materials, newItem]);
      toast.success("Thêm hóa chất mới thành công!");
    }

    setOpenForm(false);
    resetForm();
  };

  // Xóa
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa chất này?")) {
      setMaterials(materials.filter(item => item.id !== id));
      toast.error("Đã xóa hóa chất thành công!");
    }
  };

  return (
    <div className="material-management">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="700">
          <InventoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Quản lý Hóa chất & Vật tư
        </Typography>

        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Thêm Hóa Chất Mới
        </Button>
      </Box>

      {/* Tìm kiếm & Lọc */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Tìm theo mã hoặc tên hóa chất..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Loại</InputLabel>
          <Select value={filterType} label="Loại" onChange={(e) => setFilterType(e.target.value)}>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="Hóa chất">Hóa chất</MenuItem>
            <MenuItem value="Thiết bị">Thiết bị</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Bảng dữ liệu */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Mã</strong></TableCell>
              <TableCell><strong>Tên Hóa Chất</strong></TableCell>
              <TableCell><strong>Loại</strong></TableCell>
              <TableCell align="center"><strong>Đơn vị</strong></TableCell>
              <TableCell align="right"><strong>Tồn kho</strong></TableCell>
              <TableCell align="center"><strong>Trạng thái</strong></TableCell>
              <TableCell align="center"><strong>Thao tác</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMaterials.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell><strong>{item.code}</strong></TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip label={item.type} color={item.type === "Hóa chất" ? "primary" : "secondary"} size="small" />
                </TableCell>
                <TableCell align="center">{item.unit}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: item.quantity < item.minStock ? "red" : "inherit" }}>
                  {item.quantity}
                </TableCell>
                <TableCell align="center">
                  {item.quantity === 0 ? (
                    <Chip label="Hết hàng" color="error" size="small" />
                  ) : item.quantity < item.minStock ? (
                    <Chip label="Sắp hết" color="warning" size="small" />
                  ) : (
                    <Chip label="Tốt" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(item)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        </Box>
      )}

      {/* Form Thêm / Sửa */}
      <Dialog open={openForm} onClose={() => { setOpenForm(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? "Sửa thông tin hóa chất" : "Thêm hóa chất mới"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Mã hóa chất" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          <TextField fullWidth margin="normal" label="Tên hóa chất" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Loại</InputLabel>
            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <MenuItem value="Hóa chất">Hóa chất</MenuItem>
              <MenuItem value="Thiết bị">Thiết bị</MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth margin="normal" label="Đơn vị tính" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
          <TextField fullWidth margin="normal" label="Số lượng tồn" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
          <TextField fullWidth margin="normal" label="Mức tồn tối thiểu" type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenForm(false); resetForm(); }}>Hủy</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
            {editingItem ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}