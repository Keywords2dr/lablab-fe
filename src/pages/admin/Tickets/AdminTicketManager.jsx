import React, { useEffect, useState, useCallback } from 'react';
import { 
    Table, Tag, Button, Space, Select, 
    Form, Typography, message 
} from 'antd';
import { 
    EyeOutlined, SearchOutlined, ReloadOutlined, 
    ExclamationCircleOutlined, AuditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../../api/ticketApi';
import './AdminTicketManager.css';

const { Text } = Typography;

// Định nghĩa mức độ ưu tiên: Số càng nhỏ càng hiện lên đầu
const STATUS_PRIORITY = {
    PENDING_ADMIN: 1,  // Ưu tiên cao nhất
    PENDING_OWNER: 2,  // Ưu tiên thứ hai
    PENDING_RETURN: 3,
    BORROWED: 4,
    APPROVED: 10,      // Nhóm hoàn thành đẩy xuống cuối
    REJECTED: 11,
    RETURNED: 12,
    CANCELLED: 13,
};

const TICKET_STATUS = {
    PENDING_OWNER:  { label: 'Chờ GV Duyệt',   color: 'orange'   },
    PENDING_ADMIN:  { label: 'Chờ Admin Duyệt', color: 'cyan'     },
    APPROVED:       { label: 'Đã Duyệt',       color: 'green'    },
    BORROWED:       { label: 'Đang Mượn',       color: 'blue'     },
    PENDING_RETURN: { label: 'Chờ Trả',         color: 'purple'   },
    RETURNED:       { label: 'Đã Trả',          color: 'default'  },
    REJECTED:       { label: 'Bị Từ Chối',      color: 'red'      },
    CANCELLED:      { label: 'Đã Hủy',          color: 'default'  },
};

const TICKET_TYPE = {
    ROOM_ONLY:         { label: 'Chỉ Mượn Phòng',   color: 'blue'     },
    CHEMICAL_ONLY:     { label: 'Mượn Hóa Chất',    color: 'geekblue' },
    ROOM_AND_CHEMICAL: { label: 'Phòng & Hóa Chất', color: 'purple'   },
};

const AdminTicketManager = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchTickets = useCallback(async (page = 1, size = 10, filters = {}) => {
        setLoading(true);
        try {
            const params = { page: page - 1, size, ...filters };
            const res = await ticketApi.getAllForAdmin(params);

            const actualData = res?.content || res?.data?.content || [];
            const total = res?.totalElements || res?.data?.totalElements || 0;

            // --- PHẦN FIX SẮP XẾP ƯU TIÊN ---
            const sortedData = [...actualData].sort((a, b) => {
                const priorityA = STATUS_PRIORITY[a.status] || 99;
                const priorityB = STATUS_PRIORITY[b.status] || 99;

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                // Nếu cùng trạng thái, phiếu nào mới hơn (ID lớn hơn) hiện lên trước
                return b.ticketId - a.ticketId;
            });

            setData(sortedData);
            setPagination({ current: page, pageSize: size, total });
        } catch (error) {
            console.error('API Error:', error);
            message.error('Không thể kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const columns = [
        {
            title: 'Người yêu cầu',
            dataIndex: 'requesterName',
            key: 'requesterName',
            render: (text, record) => (
                <div>
                    <div className="atm-requester-name">{text || 'N/A'}</div>
                    <div className="atm-requester-role">{record.requesterRole}</div>
                </div>
            ),
        },
        {
            title: 'Phòng Lab',
            dataIndex: 'roomName',
            key: 'roomName',
            render: (text) => (
                <span className="atm-room-chip">{text || '—'}</span>
            ),
        },
        {
            title: 'Loại phiếu',
            dataIndex: 'ticketType',
            key: 'ticketType',
            render: (type) => {
                const config = TICKET_TYPE[type] || { label: type, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = TICKET_STATUS[status] || { label: status, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 110,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    className="atm-btn-detail"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => navigate(`/admin/tickets/${record.ticketId}`)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="atm-page">

            {/* ── Banner ── */}
            <div className="atm-banner">
                <div className="atm-banner-icon">
                    <AuditOutlined />
                </div>
                <div className="atm-banner-body">
                    <div className="atm-banner-title">Quản lý Duyệt Phiếu Mượn</div>
                    <div className="atm-banner-sub">ADMIN / TICKET MANAGER</div>
                </div>
            </div>

            {/* ── Filter card ── */}
            <div className="atm-card">
                <Form
                    form={form}
                    layout="inline"
                    onFinish={(values) => fetchTickets(1, pagination.pageSize, values)}
                >
                    <div className="atm-filter-bar">
                        <Form.Item name="status">
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 160 }}
                                allowClear
                                popupClassName="atm-select-dropdown"
                            >
                                {Object.entries(TICKET_STATUS).map(([key, val]) => (
                                    <Select.Option key={key} value={key}>{val.label}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="ticketType">
                            <Select
                                placeholder="Loại phiếu"
                                style={{ width: 170 }}
                                allowClear
                                popupClassName="atm-select-dropdown"
                            >
                                {Object.entries(TICKET_TYPE).map(([key, val]) => (
                                    <Select.Option key={key} value={key}>{val.label}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button
                                    className="atm-btn-primary"
                                    icon={<SearchOutlined />}
                                    htmlType="submit"
                                >
                                    Lọc
                                </Button>
                                <Button
                                    className="atm-btn-ghost"
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        form.resetFields();
                                        fetchTickets(1, 10, {});
                                    }}
                                >
                                    Làm mới
                                </Button>
                            </Space>
                        </Form.Item>
                    </div>
                </Form>
            </div>

            {/* ── Table card ── */}
            <div className="atm-card atm-table-wrapper">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="ticketId"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng cộng ${total} phiếu`,
                    }}
                    onChange={(p) =>
                        fetchTickets(p.current, p.pageSize, form.getFieldsValue())
                    }
                    scroll={{ x: 800 }}
                />

                {data.length === 0 && !loading && (
                    <div className="atm-empty">
                        <ExclamationCircleOutlined className="atm-empty-icon" />
                        <span className="atm-empty-text">
                            Không tìm thấy phiếu mượn nào — hãy thử "Làm mới" hoặc kiểm tra quyền Admin.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTicketManager;