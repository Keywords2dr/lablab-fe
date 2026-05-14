import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  FileUpload,
  CloudUpload,
  CheckCircle,
  ReportProblem,
  Visibility,
  FileDownload,
  TableChart,
  ArrowForwardIos,
  ExpandMore,
} from "@mui/icons-material";
import { chemicalApi } from "../../../../api/chemicalApi";
import "../styles/ImportExportSection.css";

const MAX_SIZE_MB = 10;

function normalizeStr(str) {
  return (
    String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[^a-z0-9/\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

const FIELD_KEYWORDS = [
  {
    field: "itemCode",
    keywords: [
      "ma hoa chat",
      "ma hc",
      "item code",
      "itemcode",
      "chemical code",
      "ma so",
    ],
  },
  {
    field: "name",
    keywords: [
      "ten hoa chat",
      "ten hc",
      "chemical name",
      "ten chat",
      "ten san pham",
      "ten vat tu",
    ],
  },
  {
    field: "formula",
    keywords: [
      "cong thuc hoa hoc",
      "cong thuc",
      "formula",
      "pthh",
      "cthh",
      "phuong trinh",
    ],
  },
  {
    field: "supplier",
    keywords: [
      "nha cung cap",
      "nha cc",
      "supplier",
      "xuat xu",
      "origin",
      "hang san xuat",
      "hang sx",
      "nguon",
    ],
  },
  {
    field: "packaging",
    keywords: [
      "dong goi",
      "loai dong goi",
      "loai binh",
      "binh chua",
      "packaging",
      "quy cach",
      "cach dong",
      "size",
      "nhua",
      "thuy tinh",
      "vi du",
      "loai chai",
      "binh",
    ],
  },
  {
    field: "unit",
    keywords: ["don vi", "unit", "ml/l", "kg/g", "dvt", "don vi tinh"],
  },
  {
    field: "amountPerPackage",
    keywords: [
      "khoi luong",
      "luong/goi",
      "luong moi goi",
      "sl/goi",
      "tong khoi",
      "amountperpackage",
      "kl",
      "so luong",
      "trong luong",
      "the tich",
      "luong",
      "sl",
      "nang",
    ],
  },
];

function detectField(normalizedHeader) {
  for (const { field, keywords } of FIELD_KEYWORDS) {
    if (keywords.some((kw) => normalizedHeader.includes(kw))) return field;
  }
  return null;
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });

        let bestSheet = null;
        let bestScore = -1;
        let bestName = "";

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          if (!raw || raw.length < 2) continue;

          let maxScore = 0;
          for (let r = 0; r < Math.min(3, raw.length); r++) {
            const normHdrs = raw[r].map(normalizeStr);
            const score = normHdrs.filter((h) => detectField(h)).length;
            if (score > maxScore) maxScore = score;
          }
          console.log(`[Excel] Sheet "${sheetName}" score: ${maxScore}`);
          if (maxScore > bestScore) {
            bestScore = maxScore;
            bestSheet = wb.Sheets[sheetName];
            bestName = sheetName;
          }
        }

        if (!bestSheet) {
          reject(new Error("Không tìm thấy sheet phù hợp trong file Excel."));
          return;
        }

        console.log(`[Excel] Dùng sheet: "${bestName}" (score ${bestScore})`);
        const raw = XLSX.utils.sheet_to_json(bestSheet, {
          header: 1,
          defval: "",
        });

        let headerRowIdx = 0;
        let headerScore = 0;
        for (let r = 0; r < Math.min(5, raw.length); r++) {
          const norm = raw[r].map(normalizeStr);
          const score = norm.filter((h) => detectField(h)).length;
          if (score > headerScore) {
            headerScore = score;
            headerRowIdx = r;
          }
        }

        const rawHeaders = raw[headerRowIdx].map((h) => String(h).trim());
        const normHeaders = rawHeaders.map(normalizeStr);

        console.log("[Excel] Headers gốc:", rawHeaders);
        console.log("[Excel] Headers normalized:", normHeaders);
        console.log(
          "[Excel] Mapping:",
          normHeaders.map(
            (n, i) => `"${rawHeaders[i]}" → ${detectField(n) ?? "bỏ qua"}`,
          ),
        );

        const rows = raw
          .slice(headerRowIdx + 1)
          .map((row, i) => {
            const obj = { rowNumber: headerRowIdx + i + 2 };
            normHeaders.forEach((normH, j) => {
              const field = detectField(normH);
              if (field) {
                const val = row[j];
                if (!obj[field] || obj[field] === "") {
                  obj[field] =
                    val !== undefined && val !== null ? String(val).trim() : "";
                }
              }
            });
            return obj;
          })
          .filter((r) => {
            const { rowNumber: _rowNumber, ...rest } = r;
            return Object.values(rest).some((v) => v !== "");
          });

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export default function ImportExportSection({ totalFiltered, onOpenPreview }) {
  const [ioOpen, setIoOpen] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState(null); // { name, size }
  const [parsing, setParsing] = useState(false); // đang đọc file
  const [previewReady, setPreviewReady] = useState(false);
  const [pendingFile, setPendingFile] = useState(null); // File object chờ import
  const fileInputRef = useRef(null);

  const resetUpload = () => {
    setUploadFile(null);
    setParsing(false);
    setPreviewReady(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const readAndPreview = useCallback(
    async (file) => {
      const allowedExt = [".xlsx", ".xls", ".csv"];
      if (!allowedExt.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        toast.error("Chỉ hỗ trợ file .xlsx, .xls hoặc .csv!");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`File quá lớn! Tối đa ${MAX_SIZE_MB}MB.`);
        return;
      }

      setUploadFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
      });
      setParsing(true);
      setPreviewReady(false);

      try {
        const rows = await parseExcel(file);
        setParsing(false);
        setPreviewReady(true);
        setPendingFile(file);
        toast.info(
          `📋 Đọc được ${rows.length} dòng — hãy xem trước trước khi nhập!`,
        );

        onOpenPreview(rows, file.name, file, 0, false);
      } catch (err) {
        setParsing(false);
        toast.error(` Không thể đọc file: ${err.message}`);
      }
    },
    [onOpenPreview],
  );

  const handleFilePick = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer?.files?.[0] ?? e.target?.files?.[0];
      if (!file) return;
      readAndPreview(file);
    },
    [readAndPreview],
  );

  // ── Export / Template ──────────────────────────────────────────────────────

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    const toastId = toast.loading("📥 Đang xuất Excel...");
    try {
      const res = await chemicalApi.exportChemicals();

      let filename = `hoa-chat-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const cd =
        res.headers?.["content-disposition"] ??
        res.headers?.["Content-Disposition"];
      if (cd) {
        const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (match?.[1]) filename = match[1].replace(/['"]/g, "").trim();
      }

      const blob = new Blob([res.data], {
        type:
          res.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.update(toastId, {
        render: ` Đã xuất: ${filename}`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.update(toastId, {
        render: `❌ Xuất thất bại: ${msg}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setExporting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mm-io-section">
      <div className="mm-io-header" onClick={() => setIoOpen((v) => !v)}>
        <div className="mm-io-header-left">
          <div className="mm-io-header-icon">
            <FileUpload />
          </div>
          <div>
            <div className="mm-io-header-title">Nhập / Xuất dữ liệu</div>
            <div className="mm-io-header-sub">
              Import &amp; Export file Excel (.xlsx, .csv)
            </div>
          </div>
        </div>
        <ExpandMore className={`mm-io-chevron${ioOpen ? " open" : ""}`} />
      </div>

      {ioOpen && (
        <div className="mm-io-body">
          {/* ─ IMPORT CARD ─ */}
          <div className="mm-import-card">
            <div className="mm-card-label">
              <FileUpload /> Nhập dữ liệu từ file
            </div>

            {/* Drop zone */}
            <div
              className={`mm-dropzone${dragging ? " dragging" : ""}${parsing ? " disabled" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                if (!parsing) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleFilePick}
              onClick={() => !parsing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={handleFilePick}
              />
              <div className="mm-dropzone-icon">
                <CloudUpload />
              </div>
              <p>
                <strong>Kéo &amp; thả file vào đây</strong> hoặc{" "}
                <strong>nhấn để chọn</strong>
              </p>
              <small>
                Hỗ trợ: .xlsx · .xls · .csv — Tối đa {MAX_SIZE_MB}MB
              </small>
            </div>

            {/* Trạng thái đọc file */}
            {uploadFile && (
              <div className="mm-progress-wrap visible">
                <div className="mm-progress-meta">
                  <span className="filename">{uploadFile.name}</span>
                  <span>{uploadFile.size}</span>
                </div>
                <div
                  className={`mm-progress-status${previewReady ? " success" : parsing ? "" : ""}`}
                >
                  {parsing && <span>⏳ Đang đọc và phân tích file...</span>}
                  {previewReady && (
                    <>
                      <CheckCircle /> Đã đọc xong — xem trước bên dưới
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                className="mm-btn-import"
                disabled={!previewReady}
                onClick={() => {
                  if (pendingFile) readAndPreview(pendingFile);
                }}
              >
                <Visibility /> Xem trước dữ liệu
              </button>

              {previewReady && (
                <button
                  className="mm-btn-cancel"
                  style={{ fontSize: "0.82rem" }}
                  onClick={resetUpload}
                >
                  Chọn file khác
                </button>
              )}
            </div>
          </div>

          {/* ─ EXPORT CARD ─ */}
          <div className="mm-export-card">
            <div className="mm-card-label">
              <FileDownload /> Xuất dữ liệu ra file
            </div>
            <div className="mm-export-options">
              <div
                className={`mm-export-btn excel${exporting ? " disabled" : ""}`}
                onClick={!exporting ? handleExport : undefined}
                style={{
                  cursor: exporting ? "not-allowed" : "pointer",
                  opacity: exporting ? 0.7 : 1,
                }}
              >
                <div className="eb-icon">
                  <TableChart />
                </div>
                <div className="eb-info">
                  <strong>
                    {exporting ? "Đang xuất..." : "Xuất Excel (.xlsx)"}
                  </strong>
                  <span>
                    Toàn bộ danh sách hóa chất &amp; vật tư ({totalFiltered}{" "}
                    dòng)
                  </span>
                </div>
                {exporting ? (
                  <span
                    style={{
                      fontSize: 13,
                      animation: "spin 1s linear infinite",
                      display: "inline-block",
                    }}
                  >
                    ⏳
                  </span>
                ) : (
                  <ArrowForwardIos
                    className="eb-arrow"
                    style={{ fontSize: 14 }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
