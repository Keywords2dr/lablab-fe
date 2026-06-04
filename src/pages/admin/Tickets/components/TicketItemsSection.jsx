import React from "react";
import { ExperimentOutlined, RollbackOutlined } from "@ant-design/icons";
import { RETURN_STATUS } from "../constants/ticketConstants";

export default function TicketItemsSection({ ticket, isChemical, showReturnInfo }) {
  const items = ticket.items || [];

  return (
    <>
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

      {/* ── Thông tin hoàn trả ── */}
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

          {!isChemical && ticket.returnNote && (
            <div className="atd-room-return-note">
              <strong>Ghi chú khi trả phòng:</strong> {ticket.returnNote}
            </div>
          )}

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
                          ? <span className="atd-return-status" style={{ color: rs.color, background: rs.bg }}>{rs.label}</span>
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

          {isChemical && ticket.returnNote && (
            <div className="atd-room-return-note" style={{ margin: "0 18px 18px", marginTop: 0 }}>
              <strong>Ghi chú chung:</strong> {ticket.returnNote}
            </div>
          )}
        </div>
      )}
    </>
  );
}
