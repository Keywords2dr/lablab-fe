import React, { useMemo } from "react";
import {
  Science,
  MeetingRoom,
  MenuBook,
  ReportProblem,
  SupervisorAccount,
  TrackChanges,
  ScienceOutlined,
  SearchOutlined,
  EventAvailable,
  VerifiedUser,
  Login,
  ListAlt,
  AssignmentTurnedIn,
  RocketLaunch,
  Email,
  Phone,
  LocationOn,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import labHeroImg from "../../assets/lab_hero.png";
import "./UserDashboard.css";

const WikiIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="feat-svg">
    <rect x="30" y="20" width="140" height="100" rx="12" fill="#EEF2FF" />
    <rect x="45" y="38" width="70" height="6" rx="3" fill="#818CF8" />
    <rect x="45" y="52" width="110" height="4" rx="2" fill="#C7D2FE" />
    <rect x="45" y="62" width="95" height="4" rx="2" fill="#C7D2FE" />
    <rect x="45" y="72" width="105" height="4" rx="2" fill="#C7D2FE" />
    <rect
      x="45"
      y="86"
      width="50"
      height="20"
      rx="6"
      fill="#6366F1"
      opacity=".15"
    />
    <circle cx="155" cy="45" r="14" fill="#A5B4FC" opacity=".5" />
    <path
      d="M150 42 l5 8 l5-8"
      stroke="#6366F1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="80" r="8" fill="#E0E7FF" />
    <circle cx="180" cy="110" r="6" fill="#DDD6FE" />
  </svg>
);

const BookingIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="feat-svg">
    <rect x="25" y="25" width="150" height="110" rx="12" fill="#F0FDFA" />
    <rect
      x="25"
      y="25"
      width="150"
      height="28"
      rx="12"
      fill="#14B8A6"
      opacity=".15"
    />
    <rect x="40" y="34" width="40" height="6" rx="3" fill="#0D9488" />
    {[0, 1, 2, 3, 4].map((col) =>
      [0, 1, 2].map((row) => (
        <rect
          key={`${col}-${row}`}
          x={40 + col * 26}
          y={62 + row * 22}
          width="20"
          height="16"
          rx="4"
          fill={col === 2 && row === 1 ? "#14B8A6" : "#CCFBF1"}
          opacity={col === 2 && row === 1 ? ".9" : ".6"}
        />
      )),
    )}
    <circle cx="15" cy="70" r="6" fill="#CCFBF1" />
    <circle cx="185" cy="120" r="8" fill="#99F6E4" opacity=".5" />
  </svg>
);

const ChemIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="feat-svg">
    <path
      d="M85 30 L85 70 L60 120 Q55 130 65 135 L135 135 Q145 130 140 120 L115 70 L115 30Z"
      fill="#FEF3C7"
      stroke="#F59E0B"
      strokeWidth="2"
    />
    <path
      d="M70 105 Q100 95 130 105 L140 120 Q145 130 135 135 L65 135 Q55 130 60 120Z"
      fill="#FCD34D"
      opacity=".5"
    />
    <rect
      x="85"
      y="22"
      width="30"
      height="8"
      rx="2"
      fill="#FBBF24"
      opacity=".3"
    />
    <circle cx="95" cy="110" r="4" fill="#FDE68A" />
    <circle cx="110" cy="100" r="3" fill="#FDE68A" />
    <circle cx="105" cy="115" r="2.5" fill="#FEF3C7" />
    <circle cx="160" cy="40" r="8" fill="#FEF3C7" />
    <circle cx="40" cy="50" r="6" fill="#FDE68A" opacity=".5" />
  </svg>
);

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === "TEACHER";

  const greet = useMemo(() => {
    const h = new Date().getHours();
    return h < 12
      ? "Chào buổi sáng"
      : h < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";
  }, []);

  const modules = [
    {
      icon: <MenuBook />,
      cls: "m-blue",
      title: "Wiki & Tra cứu",
      desc: "Thông tin phòng, hóa chất & hướng dẫn",
      path: "/wiki",
    },
    {
      icon: <MeetingRoom />,
      cls: "m-sky",
      title: "Đăng ký phòng",
      desc: "Đặt lịch sử dụng phòng Lab theo ca",
      path: "/borrow/room",
    },
    {
      icon: <Science />,
      cls: "m-emerald",
      title: "Mượn hóa chất",
      desc: "Đăng ký vật tư & dụng cụ thí nghiệm",
      path: "/borrow/chemical",
    },
    {
      icon: <TrackChanges />,
      cls: "m-violet",
      title: "Phiếu của tôi",
      desc: "Theo dõi trạng thái & lịch sử mượn",
      path: "/my-tickets",
    },
    ...(isTeacher
      ? [
          {
            icon: <SupervisorAccount />,
            cls: "m-amber",
            title: "Quản lý phòng",
            desc: "Duyệt yêu cầu từ sinh viên",
            path: "/manage/assigned-rooms",
          },
        ]
      : []),
    {
      icon: <ReportProblem />,
      cls: "m-rose",
      title: "Báo cáo sự cố",
      desc: "Thông báo hư hỏng, mất mát",
      path: "/report",
    },
  ];

  const features = [
    {
      icon: <SearchOutlined />,
      title: "Tra cứu Wiki thông minh",
      desc: "Tìm kiếm nhanh chóng thông tin về hóa chất, vật tư, dụng cụ thí nghiệm. Hệ thống cung cấp hướng dẫn sử dụng chi tiết, cảnh báo an toàn và thông số kỹ thuật đầy đủ.",
      illustration: <WikiIllustration />,
      color: "feat-indigo",
      path: "/wiki",
    },
    {
      icon: <EventAvailable />,
      title: "Đặt phòng Lab trực tuyến",
      desc: "Đăng ký sử dụng phòng thí nghiệm theo ca một cách dễ dàng. Xem lịch trống, chọn thời gian phù hợp và nhận xác nhận tự động từ hệ thống.",
      illustration: <BookingIllustration />,
      color: "feat-teal",
      path: "/borrow/room",
    },
    {
      icon: <Science />,
      title: "Mượn hóa chất & vật tư",
      desc: "Tạo phiếu mượn hóa chất, dụng cụ thí nghiệm trực tuyến. Theo dõi trạng thái phiếu mượn theo thời gian thực, nhận thông báo khi phiếu được duyệt.",
      illustration: <ChemIllustration />,
      color: "feat-amber",
      path: "/borrow/chemical",
    },
  ];

  const steps = [
    {
      icon: <Login />,
      num: "01",
      title: "Đăng nhập",
      desc: "Truy cập hệ thống bằng tài khoản trường",
    },
    {
      icon: <ListAlt />,
      num: "02",
      title: "Chọn dịch vụ",
      desc: "Đặt phòng hoặc mượn hóa chất, vật tư",
    },
    {
      icon: <AssignmentTurnedIn />,
      num: "03",
      title: "Tạo phiếu",
      desc: "Điền thông tin và gửi yêu cầu mượn",
    },
    {
      icon: <VerifiedUser />,
      num: "04",
      title: "Nhận duyệt",
      desc: "Theo dõi và nhận kết quả phê duyệt",
    },
  ];

  return (
    <div className="dash">
      <div className="dash-inner">
        {/* ═══════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════ */}
        <section className="dash-hero dash-anim">
          <div className="dash-hero-pattern" />
          <div className="dash-hero-content">
            <div className="dash-hero-eyebrow">
              <span className="live-dot" />
              Hệ thống đang hoạt động
            </div>
            <h1>
              {greet},{" "}
              <span className="user-name">{user?.username || "bạn"}</span> 👋
            </h1>
            <p className="dash-hero-desc">
              Nền tảng quản lý phòng thí nghiệm thông minh — đặt lịch mượn theo
              ca, tra cứu thông tin vật tư và theo dõi phiếu mượn thời gian
              thực.
            </p>
            <div className="dash-hero-btns">
              <button
                className="dash-hero-btn accent"
                onClick={() => navigate("/wiki")}
              >
                <MenuBook style={{ fontSize: 18 }} /> Truy cập Wiki
              </button>
              <button
                className="dash-hero-btn ghost"
                onClick={() => navigate("/my-tickets")}
              >
                <TrackChanges style={{ fontSize: 18 }} /> Phiếu của tôi
              </button>
            </div>
          </div>
          <div className="dash-hero-image">
            <img src={labHeroImg} alt="Laboratory illustration" />
          </div>
        </section>

        {/* ═══════════════════════════════════
            FEATURE HIGHLIGHTS
            ═══════════════════════════════════ */}
        <section className="dash-features-section dash-anim da-2">
          <div className="dash-features-header">
            <span className="dash-section-chip">Tính năng nổi bật</span>
            <h2>Mọi thứ bạn cần, chỉ trong một nền tảng</h2>
            <p>
              Quản lý phòng thí nghiệm chưa bao giờ dễ dàng đến thế. Trải nghiệm
              các tính năng được thiết kế dành riêng cho giảng viên và sinh
              viên.
            </p>
          </div>
          <div className="dash-features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`dash-feature-card ${f.color} dash-anim da-${i + 3}`}
                onClick={() => navigate(f.path)}
              >
                <div className="feat-card-top">
                  <div className="feat-icon-wrap">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
                <div className="feat-card-illust">{f.illustration}</div>
                <div className="feat-card-link">
                  Khám phá ngay <ArrowForward style={{ fontSize: 16 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            HOW IT WORKS
            ═══════════════════════════════════ */}
        <section className="dash-how-section dash-anim da-4">
          <div className="dash-features-header">
            <span className="dash-section-chip">Quy trình sử dụng</span>
            <h2>Bắt đầu chỉ với 4 bước đơn giản</h2>
            <p>
              Từ đăng nhập đến hoàn tất mượn — mọi thứ được tối ưu cho sự tiện
              lợi tối đa.
            </p>
          </div>
          <div className="dash-how-steps">
            {steps.map((st, i) => (
              <div
                key={st.num}
                className={`dash-how-step dash-anim da-${i + 3}`}
              >
                <div className="how-step-num">{st.num}</div>
                <div className="how-step-icon">{st.icon}</div>
                <h4>{st.title}</h4>
                <p>{st.desc}</p>
                {i < steps.length - 1 && <div className="how-step-connector" />}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            MODULE CARDS
            ═══════════════════════════════════ */}
        <h2 className="dash-sec-title dash-anim da-3">Chức năng chính</h2>
        <div className="dash-modules">
          {modules.map((m, i) => (
            <div
              key={m.title}
              className={`dash-module ${m.cls} dash-anim da-${Math.min(i + 3, 6)}`}
              onClick={() => navigate(m.path)}
            >
              <div className="dash-module-icon">{m.icon}</div>
              <div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════ */}
      <section className="dash-cta">
        <div className="dash-cta-orb dash-cta-orb-1" />
        <div className="dash-cta-orb dash-cta-orb-2" />
        <div className="dash-cta-inner">
          <RocketLaunch style={{ fontSize: 40, opacity: 0.9 }} />
          <h2>Sẵn sàng bắt đầu?</h2>
          <p>
            Đăng ký phòng, mượn hóa chất, tra cứu thông tin — tất cả chỉ trong
            vài cú click. Hệ thống LabLab luôn sẵn sàng hỗ trợ bạn.
          </p>
          <div className="dash-cta-btns">
            <button
              className="dash-cta-btn primary"
              onClick={() => navigate("/borrow/room")}
            >
              <MeetingRoom style={{ fontSize: 18 }} /> Đặt phòng ngay
            </button>
            <button
              className="dash-cta-btn secondary"
              onClick={() => navigate("/borrow/chemical")}
            >
              <Science style={{ fontSize: 18 }} /> Mượn hóa chất
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FOOTER
          ═══════════════════════════════════ */}
      <footer className="dash-footer">
        <div className="dash-footer-inner">
          <div className="dash-footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <ScienceOutlined style={{ fontSize: 24, color: "#60a5fa" }} />
                <span>
                  Lab<em>Lab</em>.
                </span>
              </div>
              <p>
                Nền tảng quản lý phòng thí nghiệm trực tuyến dành cho trường đại
                học. Tối ưu hóa quy trình mượn phòng, hóa chất và vật tư thí
                nghiệm.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4>Truy cập nhanh</h4>
              <ul>
                <li onClick={() => navigate("/")}>Trang chủ</li>
                <li onClick={() => navigate("/wiki")}>Wiki & Tra cứu</li>
                <li onClick={() => navigate("/my-tickets")}>Phiếu của tôi</li>
                <li onClick={() => navigate("/borrow-history")}>
                  Lịch sử mượn
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="footer-col">
              <h4>Tính năng</h4>
              <ul>
                <li onClick={() => navigate("/borrow/room")}>Đặt phòng Lab</li>
                <li onClick={() => navigate("/borrow/chemical")}>
                  Mượn hóa chất
                </li>
                <li onClick={() => navigate("/profile")}>Hồ sơ cá nhân</li>
                <li onClick={() => navigate("/notifications")}>Thông báo</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4>Liên hệ</h4>
              <ul className="footer-contact">
                <li>
                  <Email style={{ fontSize: 15 }} /> lablab@university.edu.vn
                </li>
                <li>
                  <Phone style={{ fontSize: 15 }} /> (028) 1234-5678
                </li>
                <li>
                  <LocationOn style={{ fontSize: 15 }} /> TP. Hồ Chí Minh, Việt
                  Nam
                </li>
              </ul>
            </div>
          </div>

          <div className="dash-footer-divider" />
          <div className="dash-footer-bottom">
            <p>
              © {new Date().getFullYear()} LabLab. Được phát triển bởi đội ngũ
              sinh viên.
            </p>
            <p className="footer-credits">
              Phiên bản 1.0 — Quản lý phòng thí nghiệm
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
