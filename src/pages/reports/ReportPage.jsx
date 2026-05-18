import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reportApi } from '../../api/reportApi';
import { roomApi } from '../../api/roomApi';
import './ReportPage.css';

// ==================== CONFIG ====================
const REPORT_TYPE_OPTIONS = [
  { value: 'ROOM', label: 'Báo cáo phòng', desc: 'Sự cố liên quan đến phòng lab', cls: 'room' },
  { value: 'CHEMICAL', label: 'Báo cáo hóa chất', desc: 'Sự cố liên quan đến hóa chất', cls: 'chemical' },
];

const REPORT_TYPE_LABELS = {
  ROOM: 'Phòng',
  CHEMICAL: 'Hóa chất',
};

// ==================== HELPER ====================
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ==================== STEP INDICATOR ====================
const STEPS = ['Loại báo cáo', 'Chi tiết', 'Xác nhận'];

function StepBar({ current }) {
  return (
    <div className="rp-steps">
      {STEPS.map((label, idx) => {
        const state = idx < current ? 'done' : idx === current ? 'active' : '';
        return (
          <div key={label} className={`rp-step ${state}`}>
            <div className="rp-step-num">
              {idx < current ? '✓' : idx + 1}
            </div>
            <span className="rp-step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ==================== HISTORY TAB ====================
function HistoryTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getMyReports({ page, size: 10 });
      const data = res.data;
      setReports(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Không thể tải lịch sử báo cáo');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) {
    return (
      <div className="rp-history-card">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="rp-skeleton-item">
            <div className="rp-skeleton-dot" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="rp-skeleton-line" style={{ width: '60%' }} />
              <div className="rp-skeleton-line" style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0 && page === 0) {
    return (
      <div className="rp-history-card">
        <div className="rp-empty">
          <div className="rp-empty-icon" />
          <div>Bạn chưa gửi báo cáo nào</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rp-history-card">
        <div className="rp-history-header">Lịch sử báo cáo của bạn ({totalElements})</div>
        <div className="rp-history-list">
          {reports.map(item => (
            <div
              key={item.reportId}
              className={`rp-history-item ${selected?.reportId === item.reportId ? 'expanded' : ''}`}
              onClick={() => setSelected(selected?.reportId === item.reportId ? null : item)}
            >
              <div className={`rp-history-dot ${item.reportType === 'CHEMICAL' ? 'chemical' : 'room'}`} />
              <div className="rp-history-info">
                <div className="rp-history-title">
                  {REPORT_TYPE_LABELS[item.reportType] || item.reportType}
                  {item.roomName && <span className="rp-history-room"> — {item.roomName}</span>}
                </div>
                <div className="rp-history-meta">
                  {item.itemName && <span>{item.itemName}</span>}
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                {selected?.reportId === item.reportId && (
                  <div className="rp-history-detail-expand">
                    <p className="rp-history-desc">{item.description}</p>
                    {item.reporterName && (
                      <p className="rp-history-sub">Người báo cáo: {item.reporterName}</p>
                    )}
                  </div>
                )}
              </div>
              <span className={`rp-type-badge ${item.reportType?.toLowerCase()}`}>
                {item.reportType === 'ROOM' ? 'Phòng' : 'Hóa chất'}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="rp-pagination">
            <span className="rp-page-info">Trang {page + 1} / {totalPages}</span>
            <div className="rp-page-buttons">
              <button className="rp-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`rp-page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
              <button className="rp-page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ==================== SUBMIT FORM ====================
const INITIAL_FORM = {
  reportType: '',
  roomId: '',
  itemId: '',
  description: '',
};

function SubmitForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  // Data loading
  const [rooms, setRooms] = useState([]);
  const [roomItems, setRoomItems] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const setField = useCallback((key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  // Fetch rooms khi component mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await roomApi.getRooms({ size: 100 });
        const data = res.data?.content || res.data || [];
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Không thể tải danh sách phòng');
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // Fetch items khi chọn room + type = CHEMICAL
  useEffect(() => {
    if (form.reportType !== 'CHEMICAL' || !form.roomId) {
      setRoomItems([]);
      return;
    }
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const res = await roomApi.getRoomInventory(form.roomId, 0, 200);
        const data = res.data?.content || res.data || [];
        setRoomItems(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Không thể tải danh sách hóa chất trong phòng');
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, [form.reportType, form.roomId]);

  // Reset itemId khi đổi reportType hoặc roomId
  useEffect(() => {
    setField('itemId', '');
  }, [form.reportType, form.roomId, setField]);

  // Validation
  const canNext0 = form.reportType && form.roomId;
  const canNext1 = form.description.trim().length >= 10 &&
    (form.reportType === 'ROOM' || (form.reportType === 'CHEMICAL' && form.itemId));

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        reportType: form.reportType,
        roomId: form.roomId,
        description: form.description.trim(),
      };
      if (form.reportType === 'CHEMICAL' && form.itemId) {
        payload.itemId = form.itemId;
      }
      const res = await reportApi.createReport(payload);
      setSubmittedReport(res.data);
      toast.success('Báo cáo đã được gửi thành công!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setStep(0);
    setSubmittedReport(null);
  };

  // Lookup helpers
  const selectedRoom = rooms.find(r => r.roomId === form.roomId);
  const selectedItem = roomItems.find(i => (i.item?.itemId || i.itemId) === form.itemId);
  const selectedItemName = selectedItem?.item?.name || selectedItem?.name || selectedItem?.itemName || '';

  // ── Success screen ──
  if (submittedReport) {
    return (
      <div className="rp-success-screen">
        <div className="rp-success-icon">✓</div>
        <h2 className="rp-success-title">Báo cáo đã được gửi!</h2>
        <p className="rp-success-desc">
          Quản trị viên sẽ xem xét báo cáo của bạn trong thời gian sớm nhất.
        </p>
        <div className="rp-success-detail">
          <div className="rp-success-row">
            <span>Loại</span>
            <span>{REPORT_TYPE_LABELS[submittedReport.reportType]}</span>
          </div>
          <div className="rp-success-row">
            <span>Phòng</span>
            <span>{submittedReport.roomName || '—'}</span>
          </div>
          {submittedReport.itemName && (
            <div className="rp-success-row">
              <span>Hóa chất</span>
              <span>{submittedReport.itemName}</span>
            </div>
          )}
        </div>
        <button className="rp-btn-next" onClick={resetForm} style={{ marginTop: 8 }}>
          Gửi báo cáo mới
        </button>
      </div>
    );
  }

  return (
    <>
      <StepBar current={step} />

      <div className="rp-form-card">
        {/* ===== STEP 0: Loại báo cáo + Phòng ===== */}
        {step === 0 && (
          <>
            <div>
              <div className="rp-form-section-title">Loại báo cáo <span className="required">*</span></div>
              <div className="rp-type-selector">
                {REPORT_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rp-type-btn ${opt.cls} ${form.reportType === opt.value ? 'selected' : ''}`}
                    onClick={() => setField('reportType', opt.value)}
                  >
                    <span className="rp-type-btn-label">{opt.label}</span>
                    <small className="rp-type-btn-desc">{opt.desc}</small>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="rp-form-section-title">Chọn phòng <span className="required">*</span></div>
              <div className="rp-form-group" style={{ marginTop: 10 }}>
                <label>Phòng cần báo cáo</label>
                <select
                  id="rp-room"
                  className="rp-select"
                  value={form.roomId}
                  onChange={e => setField('roomId', e.target.value)}
                  disabled={loadingRooms}
                >
                  <option value="">{loadingRooms ? 'Đang tải...' : '-- Chọn phòng --'}</option>
                  {rooms.map(r => (
                    <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rp-form-footer">
              <div />
              <button
                className="rp-btn-next"
                onClick={() => setStep(1)}
                disabled={!canNext0}
              >
                Tiếp theo →
              </button>
            </div>
          </>
        )}

        {/* ===== STEP 1: Chi tiết ===== */}
        {step === 1 && (
          <>
            <div>
              <div className="rp-form-section-title">Chi tiết báo cáo</div>

              {form.reportType === 'CHEMICAL' && (
                <div className="rp-form-group" style={{ marginTop: 10 }}>
                  <label>Hóa chất <span className="required">*</span></label>
                  <select
                    id="rp-item"
                    className="rp-select"
                    value={form.itemId}
                    onChange={e => setField('itemId', e.target.value)}
                    disabled={loadingItems}
                  >
                    <option value="">{loadingItems ? 'Đang tải...' : '-- Chọn hóa chất --'}</option>
                    {roomItems.map(ri => {
                      const itemId = ri.item?.itemId || ri.itemId;
                      const itemName = ri.item?.name || ri.name || ri.itemName || 'Không rõ';
                      return (
                        <option key={itemId} value={itemId}>{itemName}</option>
                      );
                    })}
                  </select>
                  {roomItems.length === 0 && !loadingItems && (
                    <small style={{ color: '#94a3b8', marginTop: 4, fontSize: 12 }}>
                      Phòng này chưa có hóa chất nào
                    </small>
                  )}
                </div>
              )}

              <div className="rp-form-group" style={{ marginTop: 16 }}>
                <label>Mô tả chi tiết <span className="required">*</span></label>
                <textarea
                  id="rp-description"
                  className="rp-textarea"
                  placeholder="Mô tả rõ ràng sự cố đã xảy ra... (tối thiểu 10 ký tự)"
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  maxLength={1000}
                />
                <small style={{ color: form.description.length < 10 ? '#ef4444' : '#94a3b8', fontSize: 12 }}>
                  {form.description.length}/1000 ký tự
                  {form.description.length < 10 ? ` (cần thêm ${10 - form.description.length} ký tự nữa)` : ''}
                </small>
              </div>
            </div>

            <div className="rp-form-footer">
              <button className="rp-btn-back" onClick={() => setStep(0)}>← Quay lại</button>
              <button
                className="rp-btn-next"
                onClick={() => setStep(2)}
                disabled={!canNext1}
              >
                Xem lại →
              </button>
            </div>
          </>
        )}

        {/* ===== STEP 2: Xác nhận ===== */}
        {step === 2 && (
          <>
            <div>
              <div className="rp-form-section-title">Xác nhận thông tin báo cáo</div>
              <div className="rp-preview-card" style={{ marginTop: 10 }}>
                {[
                  ['Loại báo cáo', REPORT_TYPE_LABELS[form.reportType] || form.reportType],
                  ['Phòng', selectedRoom?.roomName || form.roomId],
                  ...(form.reportType === 'CHEMICAL' ? [['Hóa chất', selectedItemName || form.itemId]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="rp-preview-row">
                    <span className="rp-preview-key">{k}</span>
                    <span className="rp-preview-val">{v}</span>
                  </div>
                ))}
                <div className="rp-preview-row" style={{ alignItems: 'flex-start' }}>
                  <span className="rp-preview-key">Mô tả</span>
                  <span className="rp-preview-val" style={{ whiteSpace: 'pre-wrap' }}>{form.description}</span>
                </div>
              </div>
            </div>

            <div className="rp-form-footer">
              <button className="rp-btn-back" onClick={() => setStep(1)}>← Chỉnh sửa</button>
              <button
                className="rp-btn-next"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ==================== MAIN PAGE ====================
export default function ReportPage() {
  const [activeTab, setActiveTab] = useState('submit');

  return (
    <div className="rp-page">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-icon">🚨</div>
        <div className="rp-header-text">
          <h1>Báo cáo Sự cố</h1>
          <p>Gửi báo cáo sự cố trong phòng lab để quản trị viên xử lý kịp thời</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rp-tabs">
        <button
          id="rp-tab-submit"
          className={`rp-tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Gửi báo cáo
        </button>
        <button
          id="rp-tab-history"
          className={`rp-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử báo cáo
        </button>
      </div>

      {/* Content */}
      {activeTab === 'submit' ? <SubmitForm /> : <HistoryTab />}
    </div>
  );
}
