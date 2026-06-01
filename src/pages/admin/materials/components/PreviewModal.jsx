import React, { useState } from "react";
import {
  Close,
  CheckCircle,
  Warning,
  ErrorRounded,
  Upload,
} from "@mui/icons-material";
import "../styles/PreviewModal.css";

export default function PreviewModal({
  open,
  data,
  fileName,
  mode = "preview",
  result,
  onClose,
  onConfirm,
}) {
  const [importing, setImporting] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  if (!open) return null;

  if (mode === "preview") {
    const rows = Array.isArray(data) ? data : [];

    const handleConfirm = async () => {
      setImporting(true);
      try {
        await onConfirm();
      } finally {
        setImporting(false);
      }
    };

    return (
      <div className="mm-overlay">
        <div className="mm-preview-modal" style={{ maxWidth: 1000 }}>
          <div className="mm-preview-header">
            <div className="mm-preview-title">
              Xem trước dữ liệu nhập
              <span>
                từ file: {fileName} — {rows.length} dòng
              </span>
            </div>
            <button
              className="mm-modal-close"
              onClick={onClose}
              disabled={importing}
            >
              <Close />
            </button>
          </div>

          <div className="mm-preview-body">
            <div className="mm-preview-stats">
              <div className="mm-preview-stat">
                <strong>{rows.length}</strong> Tổng dòng sẽ nhập
              </div>
              <div
                className="mm-preview-stat"
                style={{
                  background: "#eff6ff",
                  borderColor: "#bfdbfe",
                  color: "#1d4ed8",
                }}
              >
                🔖 Mã hóa chất sẽ được hệ thống tự sinh
              </div>
            </div>

            {rows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                }}
              >
                Không đọc được dữ liệu. Hãy mở DevTools Console để xem headers
                thực tế trong file.
              </div>
            ) : (
              <div className="mm-preview-table-wrap">
                <table className="mm-preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên hóa chất</th>
                      <th>Công thức</th>
                      <th>Đơn vị</th>
                      <th>Đóng gói</th>
                      <th>Lượng/gói</th>
                      <th>Nhà CC</th>
                      <th>Nơi lưu chứa</th>
                      <th>Số lượng (Chai)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          {row.rowNumber ?? i + 1}
                        </td>
                        <td style={{ fontWeight: 600, color: "#1e293b" }}>
                          {row.name || "—"}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            color: "#4f46e5",
                          }}
                        >
                          {row.formula || "—"}
                        </td>
                        <td>{row.unit || "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {row.packaging || "—"}
                        </td>
                        <td>{row.amountPerPackage || "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {row.supplier || "—"}
                        </td>
                        <td style={{ fontWeight: 600, color: "#0ea5e9" }}>
                          {row.roomName || "—"}
                        </td>
                        <td style={{ fontWeight: 600, color: "#10b981" }}>
                          {row.packageCount || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mm-preview-footer">
            <span style={{ color: "#64748b", fontSize: "0.82rem" }}>
              Kiểm tra kỹ trước khi nhập vào hệ thống.
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="mm-btn-cancel"
                onClick={onClose}
                disabled={importing}
              >
                Hủy
              </button>
              <button
                className="mm-btn-confirm-import"
                onClick={handleConfirm}
                disabled={importing || rows.length === 0}
              >
                {importing ? (
                  <>
                    <span style={{ marginRight: 6 }}>⏳</span>Đang nhập...
                  </>
                ) : (
                  <>
                    <Upload style={{ fontSize: 16 }} /> Xác nhận nhập{" "}
                    {rows.length} dòng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CẬP NHẬT LOGIC: Tách biến newCount và updatedCount
  const successCount = result?.successCount ?? 0;
  const newCount = result?.newCount ?? 0;
  const updatedCount = result?.updatedCount ?? 0;

  const failures = Array.isArray(result?.failures) ? result.failures : [];
  const errCount = failures.length;
  const total = successCount + errCount;

  const statusIcon = {
    error: <ErrorRounded style={{ fontSize: 14, color: "#dc2626" }} />,
    err: <ErrorRounded style={{ fontSize: 14, color: "#dc2626" }} />,
    warn: <Warning style={{ fontSize: 14, color: "#d97706" }} />,
  };

  const failRows = failures.map((f) => ({
    rowNumber: f.rowNumber ?? "?",
    itemCode: f.data?.itemCode ?? f.itemCode ?? "—",
    name: f.data?.name ?? f.name ?? "—",
    formula: f.data?.formula ?? f.formula ?? "—",
    unit: f.data?.unit ?? f.unit ?? "—",
    packaging: f.data?.packaging ?? f.packaging ?? "—",
    amountPerPackage: f.data?.amountPerPackage ?? f.amountPerPackage ?? "—",
    supplier: f.data?.supplier ?? f.supplier ?? "—",
    roomName: f.data?.roomName ?? f.roomName ?? "—",
    packageCount: f.data?.packageCount ?? f.packageCount ?? "—",
    _status: "error",
    _msg: f.reason ?? f.message ?? "Lỗi không xác định",
  }));

  const handleCloseResult = () => {
    if (errCount > 0 && !showConfirmClose) {
      setShowConfirmClose(true);
    } else {
      setShowConfirmClose(false);
      onClose();
    }
  };

  return (
    <div className="mm-overlay">
      <div className="mm-preview-modal" style={{ maxWidth: 1000 }}>
        <div className="mm-preview-header">
          <div className="mm-preview-title">
            Kết quả nhập dữ liệu
            <span>từ file: {fileName}</span>
          </div>
          <button className="mm-modal-close" onClick={handleCloseResult}>
            <Close />
          </button>
        </div>

        <div className="mm-preview-body">
          {/* Stats */}
          <div className="mm-preview-stats">
            <div className="mm-preview-stat">
              <strong>{total}</strong> Tổng dòng
            </div>

            {/* CẬP NHẬT UI: Hiển thị chi tiết số lượng tạo mới và cộng dồn */}
            <div
              className="mm-preview-stat"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0,
              }}
            >
              <div>
                <strong style={{ color: "#16a34a" }}>{successCount}</strong>{" "}
                Thành công
              </div>
              {successCount > 0 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: 4,
                    fontWeight: "normal",
                  }}
                >
                  ({newCount} tạo mới, {updatedCount} cộng dồn)
                </div>
              )}
            </div>

            <div className="mm-preview-stat">
              <strong style={{ color: "#dc2626" }}>{errCount}</strong> Lỗi / Bỏ
              qua
            </div>
          </div>

          {/* Banner thành công */}
          {successCount > 0 && (
            <div className="mm-import-success-banner">
              <div className="banner-icon">✅</div>
              <div className="banner-text">
                <strong>
                  {successCount} dòng đã được xử lý ({newCount} tạo mới,{" "}
                  {updatedCount} cộng dồn)
                </strong>
                <span>
                  {result?.message ??
                    "Dữ liệu đã được lưu — danh sách bên dưới đã được làm mới."}
                </span>
              </div>
            </div>
          )}

          {/* Bảng lỗi chi tiết */}
          {failRows.length > 0 && (
            <>
              <div className="mm-import-errors-title">
                <ErrorRounded style={{ fontSize: 16 }} />
                {errCount} dòng không nhập được — chi tiết lỗi
              </div>
              <div className="mm-preview-table-wrap">
                <table className="mm-preview-table">
                  <thead>
                    <tr>
                      <th>Dòng</th>
                      <th>Mã</th>
                      <th>Tên hóa chất</th>
                      <th>Công thức</th>
                      <th>Đơn vị</th>
                      <th>Đóng gói</th>
                      <th>Lượng/gói</th>
                      <th>Nhà CC</th>
                      <th>Nơi lưu chứa</th>
                      <th>Số lượng</th>
                      <th>Lý do lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failRows.map((row, i) => (
                      <tr key={i} className="mm-preview-row-err">
                        <td
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          {row.rowNumber}
                        </td>
                        <td>
                          <span className="mm-code">{row.itemCode}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#1e293b" }}>
                          {row.name}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            color: "#4f46e5",
                          }}
                        >
                          {row.formula || "—"}
                        </td>
                        <td>{row.unit || "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {row.packaging || "—"}
                        </td>
                        <td>{row.amountPerPackage ?? "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {row.supplier || "—"}
                        </td>
                        <td>{row.roomName || "—"}</td>
                        <td>{row.packageCount ?? "—"}</td>
                        <td>
                          <span
                            className="mm-row-badge err"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {statusIcon.error} {row._msg}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tất cả thành công */}
          {failRows.length === 0 && successCount > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                color: "#15803d",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              🎉 Tất cả {successCount} dòng đều nhập thành công!
            </div>
          )}
        </div>

        <div className="mm-preview-footer">
          <div className="mm-preview-legend">
            <span className="lg-ok">Thành công</span>
            <span className="lg-err">Lỗi (bỏ qua)</span>
          </div>

          {showConfirmClose ? (
            <div className="mm-confirm-close-wrap">
              <span className="mm-confirm-close-text">
                ⚠️ Còn <strong>{errCount} dòng lỗi</strong> chưa xử lý. Bạn chắc
                chắn muốn đóng?
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="mm-btn-cancel"
                  onClick={() => setShowConfirmClose(false)}
                >
                  Xem lại lỗi
                </button>
                <button
                  className="mm-btn-confirm-import mm-btn-danger"
                  onClick={() => {
                    setShowConfirmClose(false);
                    onClose();
                  }}
                >
                  <Close style={{ fontSize: 15 }} /> Đóng
                </button>
              </div>
            </div>
          ) : (
            <button
              className="mm-btn-confirm-import"
              onClick={handleCloseResult}
            >
              <CheckCircle style={{ fontSize: 16 }} /> Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
