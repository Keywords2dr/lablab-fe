import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Table, Tag, Button, Space,
    Typography, Modal, Input, message, Skeleton,
    Result
} from 'antd';
import {
    ArrowLeftOutlined, AuditOutlined,
    UserOutlined, HomeOutlined, ExperimentOutlined,
    CalendarOutlined, BookOutlined, CloseCircleOutlined,
    CheckCircleOutlined, UserSwitchOutlined
} from '@ant-design/icons';
import ticketApi from '../../../api/ticketApi';
import './AdminTicketDetail.css';

const { Text } = Typography;

const TICKET_STATUS = {
    PENDING_OWNER:  { label: 'Chờ GV Duyệt',    color: 'orange'  },
    PENDING_ADMIN:  { label: 'Chờ Admin Duyệt',  color: 'cyan'    },
    APPROVED:       { label: 'Đã Duyệt',          color: 'green'   },
    BORROWED:       { label: 'Đang Mượn',          color: 'blue'    },
    PENDING_RETURN: { label: 'Chờ Trả',            color: 'purple'  },
    RETURNED:       { label: 'Đã Trả',             color: 'gray'    },
    REJECTED:       { label: 'Bị Từ Chối',         color: 'red'     },
    CANCELLED:      { label: 'Đã Hủy',             color: 'default' },
};

const TICKET_TYPE = {
    ROOM_ONLY:         { label: 'Chỉ Mượn Phòng',   color: 'blue'     },
    CHEMICAL_ONLY:     { label: 'Mượn Hóa Chất',    color: 'geekblue' },
    ROOM_AND_CHEMICAL: { label: 'Phòng & Hóa Chất', color: 'purple'   },
};

/* Helper: format ngày giờ */
const fmtDate = (val) =>
    val ? new Date(val).toLocaleString('vi-VN') : '—';

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
            setTicket(res?.data || res);
        } catch {
            message.error('Không thể tải chi tiết phiếu mượn!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadDetail();
    }, [id]);

    const handleApproveAction = async (approved) => {
        if (!approved && !rejectReason.trim()) {
            return message.warning('Vui lòng nhập lý do từ chối!');
        }
        setSubmitting(true);
        try {
            await ticketApi.adminApprove(id, {
                approved,
                rejectedReason: approved ? null : rejectReason,
            });
            message.success(approved ? 'Đã duyệt thành công' : 'Đã từ chối phiếu');
            setIsRejectModalOpen(false);
            loadDetail();
        } catch {
            message.error('Thao tác thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="atd-page">
                <div className="atd-skeleton-wrap">
                    <Skeleton active paragraph={{ rows: 8 }} />
                </div>
            </div>
        );
    }

    /* ── Not found ── */
    if (!ticket || !ticket.status) {
        return (
            <Result
                status="404"
                title="Không tìm thấy phiếu"
                extra={
                    <Button
                        className="atd-btn-approve"
                        onClick={() => navigate('/admin/tickets')}
                    >
                        Quay lại danh sách
                    </Button>
                }
            />
        );
    }

    const statusCfg = TICKET_STATUS[ticket.status] || { label: ticket.status, color: 'default' };
    const typeCfg   = TICKET_TYPE[ticket.ticketType] || { label: ticket.ticketType, color: 'default' };

    const roomManagerName = ticket.ownerApprovedByName || '—';

    /* ── Columns cho bảng vật tư ── */
    const itemColumns = [
        {
            title: 'Tên vật tư / hóa chất',
            dataIndex: 'itemName',
            key: 'itemName',
            render: (text) => <span className="atd-item-name">{text}</span>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantityBorrowed',
            key: 'quantityBorrowed',
            width: 160,
            render: (val, record) => (
                <span className="atd-item-qty">
                    {val} {record.itemUnit || ''}
                </span>
            ),
        },
    ];

    return (
        <div className="atd-page">

            {/* ── Back ── */}
            <Button
                className="atd-back-btn"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/tickets')}
            >
                Quay lại danh sách
            </Button>

            {/* ── Main card ── */}
            <div className="atd-main-card ant-card">
                {/* Card header */}
                <div style={{
                    background: 'var(--bg-elevated)',
                    borderBottom: '1.5px solid var(--border)',
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '14px 14px 0 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="atd-section-title-icon">
                            <AuditOutlined />
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                        }}>
                            Chi tiết phiếu mượn
                        </span>
                    </div>
                    <Tag className={`atd-tag atd-status-tag ${statusCfg.color}`}>
                        {statusCfg.label}
                    </Tag>
                </div>

                <div style={{ padding: '24px' }}>

                    {/* ── Section: Thông tin chung ── */}
                    <div className="atd-section-title">
                        <div className="atd-section-title-icon"><UserOutlined /></div>
                        Thông tin chung
                    </div>

                    <div className="atd-info-grid">
                        <div className="atd-info-item">
                            <span className="atd-info-label">Mã phiếu</span>
                            <span className="atd-info-value mono">{ticket.ticketId}</span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Người mượn</span>
                            <span className="atd-info-value">
                                <strong>{ticket.requesterName}</strong>
                                {ticket.requesterRole && (
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 12 }}>
                                        ({ticket.requesterRole})
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="atd-info-item">
                            <span className="atd-info-label">GV Quản lý phòng</span>
                            <span className="atd-info-value">
                                <UserSwitchOutlined style={{ color: 'var(--accent)', marginRight: 6 }} />
                                <strong>{roomManagerName}</strong>
                            </span>
                        </div>

                        <div className="atd-info-item">
                            <span className="atd-info-label">Phòng Lab</span>
                            <span className="atd-info-value">
                                <HomeOutlined style={{ color: 'var(--accent)', marginRight: 6 }} />
                                {ticket.roomName || '—'}
                            </span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Loại phiếu</span>
                            <span className="atd-info-value">
                                <Tag className={`atd-tag ${typeCfg.color}`}>{typeCfg.label}</Tag>
                            </span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Môn học</span>
                            <span className="atd-info-value">
                                <BookOutlined style={{ color: 'var(--text-muted)', marginRight: 6 }} />
                                {ticket.subjectName || '—'}
                            </span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Mã lớp</span>
                            <span className="atd-info-value">{ticket.classCode || '—'}</span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Chi tiết bài học</span>
                            <span className="atd-info-value">
                                {ticket.lessonDetail && ticket.lessonDetail.trim() !== '' ? ticket.lessonDetail : '—'}
                            </span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Mục đích</span>
                            <span className="atd-info-value">{ticket.purposeType || '—'}</span>
                        </div>
                    </div>

                    {/* ── Section: Thời gian ── */}
                    <div className="atd-section-title" style={{ marginTop: 24 }}>
                        <div className="atd-section-title-icon"><CalendarOutlined /></div>
                        Thời gian
                    </div>

                    <div className="atd-info-grid">
                        <div className="atd-info-item">
                            <span className="atd-info-label">Ngày tạo phiếu</span>
                            <span className="atd-info-value">{fmtDate(ticket.createdAt)}</span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Ngày mượn</span>
                            <span className="atd-info-value">{fmtDate(ticket.borrowDate)}</span>
                        </div>
                        <div className="atd-info-item">
                            <span className="atd-info-label">Hạn trả dự kiến</span>
                            <span className="atd-info-value">{fmtDate(ticket.expectedReturnDate)}</span>
                        </div>
                        {ticket.ownerApprovedAt && (
                            <div className="atd-info-item">
                                <span className="atd-info-label">GV Duyệt lúc</span>
                                <span className="atd-info-value">{fmtDate(ticket.ownerApprovedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Lý do từ chối (nếu có) ── */}
                    {ticket.rejectedReason && (
                        <>
                            <div className="atd-section-title" style={{ marginTop: 24 }}>
                                <div className="atd-section-title-icon" style={{ background: 'var(--danger-light)' }}>
                                    <CloseCircleOutlined style={{ color: 'var(--danger)' }} />
                                </div>
                                Lý do từ chối
                            </div>
                            <div className="atd-info-grid">
                                <div className="atd-info-item full-span">
                                    <span className="atd-info-label">Chi tiết</span>
                                    <span className="atd-info-value danger">{ticket.rejectedReason}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Danh sách hóa chất / dụng cụ ── */}
                    {ticket.ticketType !== 'ROOM_ONLY' && (
                        <>
                            <div className="atd-section-title" style={{ marginTop: 24 }}>
                                <div className="atd-section-title-icon">
                                    <ExperimentOutlined />
                                </div>
                                Danh sách hóa chất &amp; dụng cụ
                            </div>
                            <div className="atd-items-table">
                                <Table
                                    dataSource={ticket.items || []}
                                    rowKey={(r) => r.detailId || r.itemId || Math.random()}
                                    pagination={false}
                                    columns={itemColumns}
                                />
                            </div>
                        </>
                    )}

                    {/* ── Action bar ── */}
                    {ticket.status === 'PENDING_ADMIN' && (
                        <div className="atd-action-bar">
                            <Button
                                className="atd-btn-reject"
                                icon={<CloseCircleOutlined />}
                                onClick={() => setIsRejectModalOpen(true)}
                            >
                                Từ chối
                            </Button>
                            <Button
                                className="atd-btn-approve"
                                icon={<CheckCircleOutlined />}
                                loading={submitting}
                                onClick={() => handleApproveAction(true)}
                            >
                                Phê duyệt phiếu
                            </Button>
                        </div>
                    )}

                </div>
            </div>

            {/* ── Modal từ chối ── */}
            <Modal
                className="atd-reject-modal"
                title="Xác nhận từ chối phiếu"
                open={isRejectModalOpen}
                onOk={() => handleApproveAction(false)}
                onCancel={() => setIsRejectModalOpen(false)}
                confirmLoading={submitting}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p className="atd-modal-label">
                    Vui lòng nhập lý do từ chối để người mượn hiểu rõ hơn:
                </p>
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Mô tả lý do cụ thể..."
                />
            </Modal>
        </div>
    );
};

export default AdminTicketDetail;