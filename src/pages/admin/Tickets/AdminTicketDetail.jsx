import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tag, Button, Modal, Input, Skeleton, Result } from "antd";
import {
  ArrowLeftOutlined, AuditOutlined, UserOutlined,
  ExperimentOutlined, CalendarOutlined,
  CloseCircleOutlined, CheckCircleOutlined, RollbackOutlined,
} from "@ant-design/icons";
import { useTicketDetail } from "./hooks/useTicketDetail";
import "./styles/ticketDetail.css";

/* ── Constants ──────────────────────────────────────────────── */
const TICKET_STATUS = {
  PENDING_OWNER:  { label: "Chờ GV Duyệt",   dot: "#f59e0b" },
  PENDING_ADMIN:  { label: "Chờ Admin Duyệt", dot: "#0ea5e9" },
  APPROVED:       { label: "Đã Duyệt",        dot: "#10b981" },
  BORROWED:       { label: "Đang Mượn",       dot: "#3b82f6" },
  PENDING_RETURN: { label: "Chờ Trả",         dot: "#8b5cf6" },
  RETURNED:       { label: "Đã Trả",          dot: "#94a3b8" },
  REJECTED:       { label: "Bị Từ Chối",      dot: "#ef4444" },
  CANCELLED:      { label: "Đã Hủy",          dot: "#94a3b8" },
};

const TICKET_TYPE = {
  ROOM_ONLY:     { label: "Chỉ Mượn Phòng", antColor: "blue"     },
  CHEMICAL_ONLY: { label: "Mượn Hóa Chất",  antColor: "geekblue" },
};

const RETURN_STATUS = {
  RETURNED: { label: "Đã trả đủ", color: "#059669", bg: "#d1fae5" },
  PARTIAL:  { label: "Trả thiếu", color: "#d97706", bg: "#fef3c7" },
  DAMAGED:  { label: "Hư hỏng",   color: "#dc2626", bg: "#fee2e2" },
  LOST:     { label: "Mất mát",   color: "#dc2626", bg: "#fee2e2" },
};

const PURPOSE_MAP = { TEACHING: "Giảng dạy", RESEARCH: "Nghiên cứu", EXAM: "Thi cử", OTHER: "Khác" };
const ROLE_MAP    = { STUDENT: "Sinh viên",  TEACHER: "Giảng viên",  ADMIN: "Quản trị viên" };

const fmt  = (v) => v ? new Date(v).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const dash = (v) => v || "—";

/* ── Row helper ─────────────────────────────────────────────── */
function Row({ label, highlight, highlightColor = "purple", children }) {
  const cls = highlight
    ? highlightColor === "blue" ? "atd-row atd-row--highlight-blue"
    : highlightColor === "green" ? "atd-row atd-row--highlight-green"
    : "atd-row atd-row--highlight"
    : "atd-row";
  return (
    <div className={cls}>
      <span className="atd-row-label">{label}</span>
      <span className="atd-row-value">{children}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AdminTicketDetail
   ════════════════════════════════════════════════════════════════ */
export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { ticket, loading, submitting, handleApproveAction } = useTicketDetail(id);
  const [rejectOpen,   setRejectOpen]   = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const onConfirmReject = async () => {
    const ok = await handleApproveAction(false, rejectReason);
    if (ok) { setRejectOpen(false); setRejectReason(""); }
  };

  /* Loading */
  if (loading) return (
    <div className="atd-page">
      <div className="atd-skeleton-wrap"><Skeleton active paragraph={{ rows: 10 }} /></div>
    </div>
  );

  /* Not found */
  if (!ticket || !ticket.status) return (
    <Result status="404" title="Không tìm thấy phiếu"
      extra={<Button className="atd-btn-approve" onClick={() => navigate("/admin/tickets")}>Quay lại</Button>} />
  );

  const statusCfg = TICKET_STATUS[ticket.status]   || { label: ticket.status,     dot: "#94a3b8" };
  const typeCfg   = TICKET_TYPE[ticket.ticketType] || { label: ticket.ticketType, antColor: "default" };
  const isChemical     = ticket.ticketType === "CHEMICAL_ONLY";
  const showReturnInfo = ["PENDING_RETURN", "RETURNED"].includes(ticket.status);
  const items          = ticket.items || [];

  return (
    <div className="atd-page">
      {/* ── Back ── */}
      <Button className="atd-back-btn" icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/tickets")}>
        Quay lại danh sách
      </Button>

      {/* ── Header card ── */}
      <div className="atd-header-card">
        <div className="atd-header-left">
          <div className="atd-header-icon"><AuditOutlined /></div>
          <div>
            <div className="atd-header-title">Chi tiết phiếu mượn</div>
            <div className="atd-header-sub">
              Mã&nbsp;<strong style={{ color: "#c7d2fe" }}>#{ticket.ticketId}</strong>
              &nbsp;·&nbsp;{typeCfg.label}
            </div>
          </div>
        </div>
        <div className="atd-header-right">
          <span className="atd-status-badge">
            <span className="atd-status-dot" style={{ background: statusCfg.dot }} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* ── Body 2-col ── */}
      <div className="atd-body">
        {/* Cột trái: Thông tin chung */}
        <div className="atd-card">
          <div className="atd-card-header">
            <div className="atd-card-icon atd-card-icon--purple"><UserOutlined /></div>
            <span className="atd-card-title">Thông tin chung</span>
          </div>
          <div className="atd-rows">
            {/* Các trường quan trọng: highlight */}
            <Row label="Người mượn" highlight highlightColor="purple">
              <span className="atd-row-value--bold">{dash(ticket.requesterName)}</span>
              {ticket.requesterRole && (
                <Tag style={{ marginLeft: 8, borderRadius: 100, fontSize: "0.7rem", verticalAlign: "middle" }}>
                  {ROLE_MAP[ticket.requesterRole] || ticket.requesterRole}
                </Tag>
              )}
            </Row>
            <Row label="GV Quản lý">
              <span className="atd-row-value--bold">{dash(ticket.ownerApprovedByName)}</span>
            </Row>
            <Row label="Phòng Lab" highlight highlightColor="blue">
              {ticket.roomName
                ? <Tag color="blue" style={{ borderRadius: 100 }}>{ticket.roomName}</Tag>
                : <span style={{ color: "#94a3b8" }}>—</span>}
            </Row>
            <Row label="Loại phiếu">
              <Tag className="atd-tag" color={typeCfg.antColor}>{typeCfg.label}</Tag>
            </Row>
            <Row label="Môn học">{dash(ticket.subjectName)}</Row>
            <Row label="Mã lớp">
              {ticket.classCode
                ? <span className="atd-row-value--mono">{ticket.classCode}</span>
                : "—"}
            </Row>
            <Row label="Chi tiết bài">{dash(ticket.lessonDetail?.trim())}</Row>
            <Row label="Mục đích">{PURPOSE_MAP[ticket.purposeType] || ticket.purposeType || "—"}</Row>
            {ticket.note && (
              <Row label="Ghi chú">
                <span className="atd-row-value--note">{ticket.note}</span>
              </Row>
            )}
          </div>
        </div>

        {/* Cột phải: Thời gian */}
        <div className="atd-card">
          <div className="atd-card-header">
            <div className="atd-card-icon atd-card-icon--blue"><CalendarOutlined /></div>
            <span className="atd-card-title">Thời gian</span>
          </div>
          <div className="atd-rows">
            <Row label="Ngày tạo">{fmt(ticket.createdAt)}</Row>
            <Row label="Ngày mượn" highlight highlightColor="blue">{fmt(ticket.borrowDate)}</Row>
            <Row label="Hạn trả" highlight highlightColor="green">{fmt(ticket.expectedReturnDate)}</Row>
            {ticket.ownerApprovedAt && <Row label="GV Duyệt lúc">{fmt(ticket.ownerApprovedAt)}</Row>}
          </div>
        </div>
      </div>

      {/* ── Lý do từ chối ── */}
      {ticket.rejectedReason && (
        <div className="atd-reject-card">
          <div className="atd-card-header">
            <div className="atd-card-icon atd-card-icon--red"><CloseCircleOutlined /></div>
            <span className="atd-card-title">Lý do từ chối</span>
          </div>
          <div className="atd-reject-reason">{ticket.rejectedReason}</div>
        </div>
      )}

      {/* ── Danh sách hóa chất (khi mượn) ── */}
      {isChemical && items.length > 0 && !showReturnInfo && (
        <div className="atd-chem-card">
          <div className="atd-card-header">
            <div className="atd-card-icon atd-card-icon--green"><ExperimentOutlined /></div>
            <span className="atd-card-title">Danh sách hóa chất &amp; dụng cụ mượn</span>
          </div>
          <table className="atd-chem-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên vật tư / hóa chất</th>
                <th className="center">Số lượng mượn</th>
                <th className="center">Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.detailId || i}>
                  <td style={{ color: "#94a3b8", fontSize: "0.78rem", width: 36 }}>{i + 1}</td>
                  <td><span className="atd-chem-name">{item.itemName}</span></td>
                  <td className="center"><span className="atd-chem-qty">{item.quantityBorrowed}</span></td>
                  <td className="center"><span className="atd-chem-unit">{item.itemUnit || "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Thông tin hoàn trả (PENDING_RETURN / RETURNED) ── */}
      {showReturnInfo && (
        <div className="atd-return-card">
          <div className="atd-card-header">
            <div className="atd-card-icon atd-card-icon--orange"><RollbackOutlined /></div>
            <span className="atd-card-title">Thông tin hoàn trả</span>
            <span style={{
              marginLeft: "auto", fontSize: "0.75rem", fontWeight: 600,
              color: ticket.status === "RETURNED" ? "#059669" : "#d97706",
              background: ticket.status === "RETURNED" ? "#d1fae5" : "#fef3c7",
              padding: "2px 10px", borderRadius: 100,
            }}>
              {ticket.status === "RETURNED" ? "Đã hoàn trả" : "Chờ xác nhận trả"}
            </span>
          </div>

          {/* Ghi chú trả phòng (ROOM_ONLY) */}
          {!isChemical && ticket.returnNote && (
            <div className="atd-room-return-note">
              <strong>Ghi chú khi trả phòng:</strong> {ticket.returnNote}
            </div>
          )}

          {/* Bảng hoàn trả hóa chất */}
          {isChemical && items.length > 0 && (
            <table className="atd-return-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên vật tư / hóa chất</th>
                  <th className="right">Đã mượn</th>
                  <th className="right">Thực trả</th>
                  <th className="center">Tình trạng</th>
                  <th>Ghi chú trả</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const rs = RETURN_STATUS[item.returnStatus] || null;
                  const isOk = item.quantityReturned != null && item.quantityReturned >= item.quantityBorrowed;
                  return (
                    <tr key={item.detailId || i}>
                      <td style={{ color: "#94a3b8", fontSize: "0.78rem", width: 36 }}>{i + 1}</td>
                      <td>
                        <span className="atd-chem-name">{item.itemName}</span>
                        {item.itemCode && (
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>
                            Mã: {item.itemCode}
                          </div>
                        )}
                      </td>
                      <td className="right">
                        <span className="atd-qty-borrowed">
                          {item.quantityBorrowed ?? "—"} {item.itemUnit || ""}
                        </span>
                      </td>
                      <td className="right">
                        <span className={isOk ? "atd-qty-returned-ok" : "atd-qty-returned-bad"}>
                          {item.quantityReturned ?? "—"} {item.itemUnit || ""}
                        </span>
                      </td>
                      <td className="center">
                        {rs
                          ? <span className="atd-return-status" style={{ color: rs.color, background: rs.bg }}>
                              {rs.label}
                            </span>
                          : <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      <td>
                        {item.returnNote
                          ? <span className="atd-return-note">{item.returnNote}</span>
                          : <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>Không có</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Ghi chú chung khi trả hóa chất */}
          {isChemical && ticket.returnNote && (
            <div className="atd-room-return-note" style={{ margin: "0 18px 18px", marginTop: 0 }}>
              <strong>Ghi chú chung:</strong> {ticket.returnNote}
            </div>
          )}
        </div>
      )}

      {/* ── Action bar ── */}
      {ticket.status === "PENDING_ADMIN" && (
        <div className="atd-action-bar">
          <Button className="atd-btn-reject" icon={<CloseCircleOutlined />} onClick={() => setRejectOpen(true)}>
            Từ chối phiếu
          </Button>
          <Button className="atd-btn-approve" icon={<CheckCircleOutlined />} loading={submitting}
            onClick={() => handleApproveAction(true, "")}>
            Phê duyệt phiếu
          </Button>
        </div>
      )}

      {/* ── Modal từ chối ── */}
      <Modal className="atd-reject-modal" title="Xác nhận từ chối phiếu"
        open={rejectOpen} onOk={onConfirmReject}
        onCancel={() => { setRejectOpen(false); setRejectReason(""); }}
        confirmLoading={submitting} okText="Xác nhận từ chối" cancelText="Hủy"
        okButtonProps={{ danger: true }}>
        <p className="atd-modal-label">Vui lòng nhập lý do từ chối để người mượn hiểu rõ hơn:</p>
        <Input.TextArea rows={4} value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Mô tả lý do cụ thể..." />
      </Modal>
    </div>
  );
}
