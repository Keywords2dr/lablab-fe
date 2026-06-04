import React from "react";
import { NotificationsActive } from "@mui/icons-material";

export default function StockAlertHeader({ thresholds, alerts }) {
  return (
    <div className="sa-header">
      <div className="sa-header-left">
        <div className="sa-header-icon">
          <NotificationsActive />
        </div>
        <div>
          <div className="sa-header-title">Ngưỡng Cảnh Báo Tồn Kho</div>
          <div className="sa-header-sub">
            Thiết lập mức tối thiểu để nhận cảnh báo khi hóa chất sắp hết
          </div>
        </div>
      </div>

      <div className="sa-stats">
        <div className="sa-stat-badge" title="Số ngưỡng đã cài đặt">
          <div className="num">{thresholds.length}</div>
          <div className="lbl">Đã cài đặt</div>
        </div>
        <div className="sa-stat-badge alert-badge" title="Đang cảnh báo">
          <div className="num">{alerts.length}</div>
          <div className="lbl">Đang cảnh báo</div>
        </div>
      </div>
    </div>
  );
}
