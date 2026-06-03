import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, Tag, Button, Space, Select, Form, Input, Typography, message, Tooltip,
} from 'antd';
import {
  EyeOutlined, SearchOutlined, ReloadOutlined, HistoryOutlined,
  FileTextOutlined, CalendarOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { rentTicketApi } from '../../../api/rentTicketApi';
import './AdminBorrowHistory.css';

const { Text } = Typography;

// ── Constants ───────────────────────────────────────────────
const TICKET_STATUS = {
  PENDING_OWNER:  { label: 'Chờ GV Duyệt',   color: 'orange'  },
  PENDING_ADMIN:  { label: 'Chờ Admin Duyệt', color: 'cyan'    },
  APPROVED:       { label: 'Đã Duyệt',        color: 'green'   },
  BORROWED:       { label: 'Đang Mượn',        color: 'blue'    },
  PENDING_RETURN: { label: 'Chờ Trả',          color: 'purple'  },
  RETURNED:       { label: 'Đã Trả',           color: 'default' },
  REJECTED:       { label: 'Bị Từ Chối',       color: 'red'     },
  CANCELLED:      { label: 'Đã Hủy',           color: 'default' },
};

const TICKET_TYPE = {
  ROOM_ONLY:         { label: 'Đặt phòng Lab',    color: 'blue'     },
  CHEMICAL_ONLY:     { label: 'Mượn hóa chất',    color: 'geekblue' },
  ROOM_AND_CHEMICAL: { label: 'Phòng & Hóa chất', color: 'purple'   },
};

const ROLE_LABEL = {
  STUDENT: 'Sinh viên',
  TEACHER: 'Giảng viên',
  ADMIN:   'Quản trị viên',
};

// ── Helpers ─────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return '—'; }
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

// ── Component ────────────────────────────────────────────────
export default function AdminBorrowHistory() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  // giữ filters hiện tại khi đổi trang
  const currentFilters = useRef({});

  const fetchTickets = useCallback(async (page = 1, size = 10, filters = {}) => {
    setLoading(true);
    currentFilters.current = filters;
    try {
      const params = {
        page: page - 1,
        size,
        ...(filters.status     ? { status: filters.status }         : {}),
        ...(filters.ticketType ? { ticketType: filters.ticketType } : {}),
        ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
      };
      const res = await rentTicketApi.getAllForAdmin(params);
      const content = res?.data?.content ?? res?.data ?? [];
      const total   = res?.data?.totalElements ?? (Array.isArray(content) ? content.length : 0);

      setData(Array.isArray(content) ? content : []);
      setPagination({ current: page, pageSize: size, total });
    } catch (err) {
      console.error(err);
      message.error('Không thể tải lịch sử phiếu mượn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(1, 10, {}); }, [fetchTickets]);

  const handleSearch = (values) => fetchTickets(1, pagination.pageSize, values);

  const handleReset = () => {
    form.resetFields();
    fetchTickets(1, 10, {});
  };

  // ── Columns ─────────────────────────────────────────────
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      render: (_, __, idx) => (
        <span className="abh-index">
          {(pagination.current - 1) * pagination.pageSize + idx + 1}
        </span>
      ),
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'requesterName',
      key: 'requesterName',
      render: (name, record) => (
        <div className="abh-requester">
          <div className="abh-avatar">
            {(name || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="abh-name">{name || '—'}</div>
            <div className="abh-role">
              {ROLE_LABEL[record.requesterRole] || record.requesterRole || ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phòng Lab',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (text) => text
        ? <span className="abh-room-chip">{text}</span>
        : <span className="abh-muted">—</span>,
    },
    {
      title: 'Loại phiếu',
      dataIndex: 'ticketType',
      key: 'ticketType',
      render: (type) => {
        const cfg = TICKET_TYPE[type] || { label: type || '—', color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = TICKET_STATUS[status] || { label: status || '—', color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => (
        <Tooltip title={fmtDateTime(val)}>
          <span className="abh-date">{fmtDate(val)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (val) => <span className="abh-date">{fmtDate(val)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          className="abh-btn-detail"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/admin/tickets/${record.ticketId}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // ── Stats quick ──────────────────────────────────────────
  const total       = pagination.total;
  const countByStatus = (s) => data.filter((d) => d.status === s).length;

  return (
    <div className="abh-page">

      {/* ── Banner ── */}
      <div className="abh-banner">
        <div className="abh-banner-icon"><HistoryOutlined /></div>
        <div className="abh-banner-body">
          <div className="abh-banner-title">Lịch Sử Phiếu Mượn</div>
          <div className="abh-banner-sub">ADMIN / BORROW HISTORY</div>
        </div>
        <div className="abh-banner-stats">
          <div className="abh-bstat">
            <FileTextOutlined />
            <span>{total} phiếu</span>
          </div>
        </div>
      </div>

      {/* ── Quick stat pills ── */}
      <div className="abh-pills">
        {Object.entries(TICKET_STATUS).map(([key, cfg]) => {
          const cnt = countByStatus(key);
          if (cnt === 0) return null;
          return (
            <span
              key={key}
              className={`abh-pill abh-pill-${cfg.color}`}
              onClick={() => {
                form.setFieldsValue({ status: key });
                fetchTickets(1, pagination.pageSize, { ...form.getFieldsValue(), status: key });
              }}
            >
              {cfg.label}: <strong>{cnt}</strong>
            </span>
          );
        })}
      </div>

      {/* ── Filter ── */}
      <div className="abh-card">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <div className="abh-filter-bar">

            <Form.Item name="search">
              <Input
                prefix={<UserOutlined style={{ color: '#9ba3be' }} />}
                placeholder="Tìm theo tên người yêu cầu..."
                className="abh-input"
                allowClear
                style={{ width: 240 }}
              />
            </Form.Item>

            <Form.Item name="ticketType">
              <Select
                placeholder="Loại phiếu"
                style={{ width: 185 }}
                allowClear
                classNames={{ popup: 'abh-select-dropdown' }}
              >
                {Object.entries(TICKET_TYPE).map(([key, val]) => (
                  <Select.Option key={key} value={key}>{val.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="status">
              <Select
                placeholder="Trạng thái"
                style={{ width: 185 }}
                allowClear
                classNames={{ popup: 'abh-select-dropdown' }}
              >
                {Object.entries(TICKET_STATUS).map(([key, val]) => (
                  <Select.Option key={key} value={key}>{val.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  className="abh-btn-primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Lọc
                </Button>
                <Button
                  className="abh-btn-ghost"
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  Làm mới
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ── Table ── */}
      <div className="abh-card abh-table-wrapper">
        <div className="abh-table-header">
          <span className="abh-table-title">
            <CalendarOutlined /> Danh sách phiếu mượn
          </span>
          <span className="abh-table-count">
            Tổng <strong>{total}</strong> phiếu
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="ticketId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (t) => `Tổng cộng ${t} phiếu`,
          }}
          onChange={(p) => {
            fetchTickets(p.current, p.pageSize, currentFilters.current);
          }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <div className="abh-empty">
                <HistoryOutlined className="abh-empty-icon" />
                <p className="abh-empty-text">Không tìm thấy phiếu mượn nào.</p>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
