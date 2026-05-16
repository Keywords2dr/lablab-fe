import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { ScienceOutlined, HomeOutlined } from "@mui/icons-material";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="notfound-root">
      <div className="notfound-bg">
        <div className="bubble b1" />
        <div className="bubble b2" />
        <div className="bubble b3" />
      </div>

      <div className="notfound-card">
        <div className="notfound-icon">
          <ScienceOutlined className="flask-icon" />
        </div>

        <div className="notfound-code">404</div>

        <h1 className="notfound-title">Trang không tồn tại</h1>
        <p className="notfound-desc">
          Có vẻ thí nghiệm này chưa được tạo ra.
          <br />
          Hãy quay lại trang chủ để tiếp tục.
        </p>

        <Button
          variant="contained"
          startIcon={<HomeOutlined />}
          onClick={() => navigate("/")}
          sx={{
            mt: 2,
            px: 4,
            py: 1.2,
            borderRadius: "10px",
            backgroundColor: "#2563eb",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
            "&:hover": {
              backgroundColor: "#1d4ed8",
              boxShadow: "0 6px 24px rgba(37,99,235,0.45)",
            },
          }}
        >
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
