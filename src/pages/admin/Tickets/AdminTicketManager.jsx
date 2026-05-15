import React, { useEffect, useState, useCallback } from 'react';
import { 
    Table, Tag, Button, Space, Card, Select, 
    Form, Typography, message 
} from 'antd';
import { 
    EyeOutlined, SearchOutlined, ReloadOutlined, 
    ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../../api/ticketApi'; 

const { Title, Text } = Typography;

const TICKET_STATUS = {
    PENDING_OWNER: { label: 'Chờ GV Duyệt', color: 'orange' },
    PENDING_ADMIN: { label: 'Chờ Admin Duyệt', color: 'cyan' },
    APPROVED: { label: 'Đã Duyệt', color: 'green' },
    BORROWED: { label: 'Đang Mượn', color: 'blue' },
    PENDING_RETURN: { label: 'Chờ Trả', color: 'purple' },
    RETURNED: { label: 'Đã Trả', color: 'gray' },
    REJECTED: { label: 'Bị Từ Chối', color: 'red' },
    CANCELLED: { label: 'Đã Hủy', color: 'default' },
};

const TICKET_TYPE = {
    ROOM_ONLY: { label: 'Chỉ Mượn Phòng', color: 'blue' },
    CHEMICAL_ONLY: { label: 'Mượn Hóa Chất', color: 'geekblue' },
    ROOM_AND_CHEMICAL: { label: 'Phòng & Hóa Chất', color: 'purple' } 
};

const AdminTicketManager = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ 
        current: 1, 
        pageSize: 10, 
        total: 0 
    });

    const fetchTickets = useCallback(async (page = 1, size = 10, filters = {}) => {
        setLoading(true);
        try {
            const params = { 
                page: page - 1, 
                size: size,
                ...filters 
            };

            const res = await ticketApi.getAllForAdmin(params);
            
            // FIX: Bóc tách đúng mảng 'content' từ JSON phân trang
            // Thử cả 2 trường hợp: res trực tiếp hoặc res.data tùy theo cách viết ticketApi
            const actualData = res?.content || res?.data?.content || [];
            const total = res?.totalElements || res?.data?.totalElements || 0;

            setData(actualData);
            setPagination({
                current: page,
                pageSize: size,
                total: total,
            });
        } catch (error) {
            console.error("API Error:", error);
            message.error("Không thể kết nối đến máy chủ.");
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
                <Space direction="vertical" size={0}>
                    <Text strong>{text || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {record.requesterRole}
                    </Text>
                </Space>
            )
        },
        { 
            title: 'Phòng Lab', 
            dataIndex: 'roomName', 
            key: 'roomName',
        },
        {
            title: 'Loại phiếu',
            dataIndex: 'ticketType',
            key: 'ticketType',
            render: (type) => {
                const config = TICKET_TYPE[type] || { label: type, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = TICKET_STATUS[status] || { label: status, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 110,
            fixed: 'right',
            render: (_, record) => (
                <Button 
                    type="primary" 
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
        <div style={{ padding: '24px' }}>
            <Card variant="none" style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Title level={4}>Quản lý Duyệt Phiếu Mượn</Title>
                
                <Form 
                    form={form} 
                    layout="inline" 
                    onFinish={(values) => fetchTickets(1, pagination.pageSize, values)}
                    style={{ marginTop: 20 }}
                >
                    <Form.Item name="status">
                        <Select placeholder="Chọn trạng thái" style={{ width: 160 }} allowClear>
                            {Object.entries(TICKET_STATUS).map(([key, val]) => (
                                <Select.Option key={key} value={key}>{val.label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="ticketType">
                        <Select placeholder="Loại phiếu" style={{ width: 160 }} allowClear>
                            {Object.entries(TICKET_TYPE).map(([key, val]) => (
                                <Select.Option key={key} value={key}>{val.label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">Lọc</Button>
                            <Button 
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
                </Form>
            </Card>

            <Card variant="none" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                    onChange={(p) => fetchTickets(p.current, p.pageSize, form.getFieldsValue())}
                    scroll={{ x: 800 }}
                />
                
                {data.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary">
                            <ExclamationCircleOutlined /> Không tìm thấy phiếu mượn nào. Hãy thử "Làm mới" hoặc kiểm tra lại quyền Admin.
                        </Text>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminTicketManager;