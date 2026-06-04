import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { chatApi } from "../../../api/chatApi";

// --- ROLE-BASED SUGGESTION CHIPS ---
const SUGGESTIONS = {
  ADMIN: [
    {
      label: "📋 Phiếu chờ duyệt hôm nay?",
      query: "Hiện tại có bao nhiêu phiếu đang chờ duyệt?",
    },
    {
      label: "🏠 Phòng đang được sử dụng?",
      query: "Phòng nào đang được sử dụng hiện tại?",
    },
    {
      label: "🧪 Tồn kho hóa chất?",
      query: "Hóa chất nào có số lượng tồn kho thấp nhất?",
    },
    {
      label: "📊 Lịch mượn 7 ngày tới?",
      query: "Lịch mượn phòng trong 7 ngày tới như thế nào?",
    },
  ],
  TEACHER: [
    {
      label: "📋 Phiếu cần tôi duyệt?",
      query: "Có bao nhiêu phiếu đang chờ tôi duyệt?",
    },
    {
      label: "🏠 Phòng tôi quản lý?",
      query: "Thống kê phiếu mượn tại phòng tôi quản lý",
    },
    {
      label: "↩️ Yêu cầu trả đang chờ?",
      query: "Có phiếu nào đang yêu cầu trả chờ tôi xác nhận không?",
    },
    {
      label: "📅 Lịch mượn sắp tới?",
      query: "Lịch mượn phòng sắp tới trong tuần này?",
    },
  ],
  STUDENT: [
    {
      label: "🏠 Phòng nào đang trống?",
      query: "Phòng lab nào đang trống hiện tại?",
    },
    {
      label: "🧪 Hóa chất còn không?",
      query: "Hóa chất trong kho còn bao nhiêu?",
    },
    {
      label: "📋 Cách tạo phiếu mượn?",
      query: "Hướng dẫn tôi cách tạo phiếu mượn phòng",
    },
    {
      label: "⏰ Lịch mượn của tôi?",
      query: "Lịch mượn phòng trong tuần tới như thế nào?",
    },
  ],
};

const ROLE_LABEL = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  STUDENT: "Sinh viên",
};

export function useAIChatBox() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const historyRef = useRef([]);

  const role = user?.role || "STUDENT";
  const userSuggestions = SUGGESTIONS[role] || SUGGESTIONS.STUDENT;

  // ── Khởi tạo với tin nhắn chào hỏi ─────────────────────────────────────────
  useEffect(() => {
    const greetingText = `Xin chào **${user?.username || "bạn"}** (${ROLE_LABEL[role] || role})! Tôi là trợ lý AI của hệ thống LabLab.\n\nTôi có thể giúp bạn tra cứu:\n- Trạng thái phòng đang sử dụng\n- Lịch mượn sắp tới\n- Tồn kho hóa chất\n- Thống kê phiếu mượn\n\nBạn muốn hỏi gì nào?`;
    setMessages([
      {
        id: "greet",
        text: greetingText,
        sender: "ai",
        timestamp: formatTime(),
      },
    ]);
    historyRef.current = [];
  }, [user, role]);

  // ── Tự động cuộn xuống cuối ────────────────────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // ── Gửi tin nhắn ───────────────────────────────────────────────────────────
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Thêm tin nhắn user vào UI
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        text,
        sender: "user",
        timestamp: formatTime(),
      },
    ]);
    if (!textToSend) setInputValue("");

    setIsTyping(true);

    try {
      // Gọi API backend với lịch sử hội thoại
      const response = await chatApi.sendMessage(text, historyRef.current);
      const reply =
        response.data?.reply ||
        "Xin lỗi, tôi không nhận được phản hồi. Vui lòng thử lại!";

      // Cập nhật lịch sử cho lần gửi tiếp theo (giới hạn 10 turns = 20 messages)
      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: text },
        { role: "model", content: reply },
      ].slice(-20);

      setIsTyping(false);

      // Hiển thị phản hồi với hiệu ứng streaming giả
      simulateStreaming(reply);
    } catch (error) {
      setIsTyping(false);

      const status = error?.response?.status;
      let errorMsg =
        "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau!";

      if (status === 401) {
        errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
      } else if (status === 429) {
        errorMsg =
          "Hệ thống AI đang bận, vui lòng chờ khoảng 1 phút rồi thử lại!";
      } else if (error?.message?.includes("Network")) {
        errorMsg =
          "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          text: errorMsg,
          sender: "ai",
          timestamp: formatTime(),
        },
      ]);
    }
  };

  // ── Hiệu ứng gõ từng từ (streaming giả) ────────────────────────────────────
  const simulateStreaming = (fullText) => {
    const newId = Date.now().toString() + "-ai";

    setMessages((prev) => [
      ...prev,
      { id: newId, text: "", sender: "ai", timestamp: formatTime() },
    ]);

    // Tách theo từng chunk nhỏ (~3 ký tự) để tránh vỡ Markdown giữa chừng
    const chunkSize = 3;
    const chunks = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      chunks.push(fullText.slice(i, i + chunkSize));
    }
    let index = 0;

    const interval = setInterval(() => {
      if (index < chunks.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newId ? { ...msg, text: msg.text + chunks[index] } : msg,
          ),
        );
        index++;
      } else {
        // Đảm bảo text cuối cùng luôn đúng hoàn toàn
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newId ? { ...msg, text: fullText } : msg,
          ),
        );
        clearInterval(interval);
      }
    }, 20);
  };

  // ── Xóa lịch sử chat ───────────────────────────────────────────────────────
  const handleClearChat = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử trò chuyện?")) {
      historyRef.current = [];
      const greetingText = `Đã xóa lịch sử. Chào **${user?.username || "bạn"}**, tôi có thể hỗ trợ gì thêm cho bạn?`;
      setMessages([
        {
          id: Date.now().toString(),
          text: greetingText,
          sender: "ai",
          timestamp: formatTime(),
        },
      ]);
    }
  };

  return {
    user,
    role,
    isOpen,
    setIsOpen,
    messages,
    inputValue,
    setInputValue,
    isTyping,
    messagesEndRef,
    userSuggestions,
    handleSend,
    handleClearChat,
    navigate,
  };
}

// ── Helper ───────────────────────────────────────────────────────────────────
function formatTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
