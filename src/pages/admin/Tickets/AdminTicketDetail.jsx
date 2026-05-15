import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Space, Typography, Modal, Input, message, Skeleton, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ticketApi from '../../../api/ticketApi'; 
import './AdminTicketDetail.css';

const { Text } = Typography;

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

const AdminTicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const res = await ticketApi.getDetail(id);
            // FIX TẠI ĐÂY: Bóc tách res.data nếu ticketApi trả về axios response
            const actualData = res?.data || res; 
            setTicket(actualData);
            
            // Console log để bạn kiểm tra cấu trúc nếu vẫn không ra
            console.log("Chi tiết phiếu:", actualData);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải chi tiết phiếu mượn!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (id) loadDetail(); 
    }, [id]);

    const handleApproveAction = async (approved) => {
        if (!approved && !rejectReason.trim()) return message.warning("Nhập lý do từ chối!");
        setSubmitting(true);
        try {
            // Đảm bảo tên field 'rejectedReason' khớp với Backend mong đợi
            await ticketApi.adminApprove(id, { 
                approved, 
                rejectedReason: approved ? null : rejectReason 
            });
            message.success(approved ? "Đã duyệt thành công" : "Đã từ chối");
            setIsRejectModalOpen(false);
            loadDetail(); // Tải lại dữ liệu sau khi duyệt
        } catch (error) {
            message.error("Thao tác thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: 24 }}><Skeleton active /></div>;
    
    // Kiểm tra nếu ticket không có thuộc tính status (do bóc tách sai object)
    if (!ticket || !ticket.status) return <Result status="404" title="Không tìm thấy dữ liệu chi tiết phiếu" />;

    return (
        <div className="admin-ticket-detail" style={{ padding: 24 }}>
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/tickets')} 
                style={{ marginBottom: 16 }}
            >
                Quay lại
            </Button>

            <Card 
                title="Chi tiết phiếu mượn" 
                extra={
                    <Tag color={TICKET_STATUS[ticket.status]?.color || 'default'}>
                        {TICKET_STATUS[ticket.status]?.label || ticket.status}
                    </Tag>
                }
            >
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Mã phiếu">{ticket.ticketId}</Descriptions.Item>
                    <Descriptions.Item label="Người mượn">
                        <Text strong>{ticket.requesterName}</Text> ({ticket.requesterRole})
                    </Descriptions.Item>
                    <Descriptions.Item label="Phòng Lab">{ticket.roomName || '---'}</Descriptions.Item>
                    <Descriptions.Item label="Loại phiếu">
                        <Tag color={TICKET_TYPE[ticket.ticketType]?.color}>
                            {TICKET_TYPE[ticket.ticketType]?.label}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Môn học">{ticket.subjectName}</Descriptions.Item>
                    <Descriptions.Item label="Mục đích">{ticket.purposeType}</Descriptions.Item>
                    <Descriptions.Item label="Ngày mượn">
                        {ticket.borrowDate ? new Date(ticket.borrowDate).toLocaleString('vi-VN') : '---'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hạn trả dự kiến">
                        {ticket.expectedReturnDate ? new Date(ticket.expectedReturnDate).toLocaleString('vi-VN') : '---'}
                    </Descriptions.Item>
                    {ticket.rejectedReason && (
                        <Descriptions.Item label="Lý do từ chối" span={2}>
                            <Text type="danger">{ticket.rejectedReason}</Text>
                        </Descriptions.Item>
                    )}
                </Descriptions>
                
                {/* Chỉ hiện bảng hóa chất nếu có items và không phải ROOM_ONLY */}
                {ticket.ticketType !== 'ROOM_ONLY' && ticket.items && ticket.items.length > 0 && (
                    <>
                        <Divider orientation="left">Danh sách hóa chất/dụng cụ</Divider>
                        <Table 
                            dataSource={ticket.items} 
                            rowKey={(record) => record.detailId || record.itemId} 
                            pagination={false}
                            columns={[
                                { title: 'Tên hóa chất/dụng cụ', dataIndex: 'itemName', key: 'itemName' },
                                { 
                                    title: 'Số lượng mượn', 
                                    dataIndex: 'quantityBorrowed', 
                                    key: 'quantityBorrowed',
                                    render: (v, r) => `${v} ${r.itemUnit || ''}` 
                                }
                            ]}
                        />
                    </>
                )}

                {/* Chỉ hiện nút duyệt nếu đang chờ Admin duyệt */}
                {ticket.status === 'PENDING_ADMIN' && (
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Space>
                            <Button danger onClick={() => setIsRejectModalOpen(true)}>
                                Từ chối
                            </Button>
                            <Button type="primary" loading={submitting} onClick={() => handleApproveAction(true)}>
                                Phê duyệt phiếu
                            </Button>
                        </Space>
                    </div>
                )}
            </Card>

            <Modal 
                title="Xác nhận từ chối" 
                open={isRejectModalOpen} 
                onOk={() => handleApproveAction(false)} 
                onCancel={() => setIsRejectModalOpen(false)}
                confirmLoading={submitting}
                okText="Gửi lý do"
                cancelText="Hủy"
            >
                <p>Vui lòng nhập lý do từ chối phiếu mượn này:</p>
                <Input.TextArea 
                    rows={4} 
                    value={rejectReason} 
                    onChange={e => setRejectReason(e.target.value)} 
                    placeholder="Ví dụ: Phòng đã có lịch sử dụng đột xuất..."
                />
            </Modal>
        </div>
    );
};

export default AdminTicketDetail;