import React from "react";
import { useAIChatBox } from "./useAIChatBox";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  SmartToy,
  Close,
  Send,
  DeleteSweep,
  AutoAwesome,
  SupportAgent,
} from "@mui/icons-material";
import "./AIChatBox.css";

export default function AIChatBox() {
  const {
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
  } = useAIChatBox();

  // ── Inline markdown: bold, italic, code, link ─────────────────────────────
  const renderInline = (text, baseKey = "x", isUserMsg = false) => {
    if (!text || typeof text !== "string")
      return <React.Fragment>{text || ""}</React.Fragment>;
    const result = [];
    const inlineRegex =
      /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let match;
    let k = 0;

    try {
      while ((match = inlineRegex.exec(text)) !== null) {
        if (match.index > last) {
          const plain = text.substring(last, match.index);
          if (plain)
            result.push(
              <React.Fragment key={`${baseKey}-t${k++}`}>
                {plain}
              </React.Fragment>,
            );
        }
        const m = match[0];
        if (m.startsWith("**")) {
          const inner = m.slice(2, -2);
          if (inner)
            result.push(
              <strong key={`${baseKey}-b${k++}`} className="md-bold">
                {inner}
              </strong>,
            );
        } else if (m.startsWith("*")) {
          const inner = m.slice(1, -1);
          if (inner)
            result.push(
              <em key={`${baseKey}-i${k++}`} className="md-italic">
                {inner}
              </em>,
            );
        } else if (m.startsWith("`")) {
          const inner = m.slice(1, -1);
          if (inner)
            result.push(
              <code
                key={`${baseKey}-c${k++}`}
                className={`md-inline-code${isUserMsg ? " user" : ""}`}
              >
                {inner}
              </code>,
            );
        } else {
          const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(m);
          if (lm && lm[1] && lm[2]) {
            result.push(
              <a
                key={`${baseKey}-l${k++}`}
                href={lm[2]}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(lm[2]);
                  setIsOpen(false);
                }}
                className="chat-link"
              >
                {lm[1]}
              </a>,
            );
          }
        }
        last = inlineRegex.lastIndex;
      }
      if (last < text.length) {
        const tail = text.substring(last);
        if (tail)
          result.push(
            <React.Fragment key={`${baseKey}-tail`}>{tail}</React.Fragment>,
          );
      }
    } catch {
      return <React.Fragment>{text}</React.Fragment>;
    }

    return result.length > 0 ? result : <React.Fragment>{text}</React.Fragment>;
  };

  // ── Full block-level Markdown renderer ────────────────────────────────────
  const renderText = (text, isUserMsg = false) => {
    if (!text || typeof text !== "string") return null;
    try {
      const lines = text.split("\n");
      const elements = [];
      let k = 0;
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];

        // Blank line
        if (!line || line.trim() === "") {
          i++;
          continue;
        }

        // Heading
        const headingMatch = /^(#{1,3})\s+(.+)/.exec(line);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const cls = ["md-h1", "md-h2", "md-h3"][level - 1];
          elements.push(
            <div key={k++} className={cls}>
              {renderInline(headingMatch[2], `h${k}`)}
            </div>,
          );
          i++;
          continue;
        }

        // Horizontal rule ---
        if (/^[-*_]{3,}$/.test(line.trim())) {
          elements.push(<hr key={k++} className="md-hr" />);
          i++;
          continue;
        }

        // Blockquote >
        if (line.startsWith("> ")) {
          const quoteLines = [];
          while (i < lines.length && lines[i].startsWith("> ")) {
            quoteLines.push(lines[i].slice(2));
            i++;
          }
          elements.push(
            <blockquote key={k++} className="md-blockquote">
              {quoteLines.map((ql, qi) => (
                <div key={qi}>{renderInline(ql, `bq${k}-${qi}`)}</div>
              ))}
            </blockquote>,
          );
          continue;
        }

        // Fenced code block ```
        if (line.startsWith("```")) {
          const lang = line.slice(3).trim();
          const codeLines = [];
          i++;
          while (i < lines.length && !lines[i].startsWith("```")) {
            codeLines.push(lines[i]);
            i++;
          }
          i++; // skip closing ```
          elements.push(
            <div key={k++} className="md-code-block">
              {lang && <span className="md-code-lang">{lang}</span>}
              <pre>
                <code>{codeLines.join("\n")}</code>
              </pre>
            </div>,
          );
          continue;
        }

        if (/^\s*[-*+]\s/.test(line)) {
          const items = [];
          while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
            const itemText = lines[i].replace(/^\s*[-*+]\s/, "").trim();
            if (itemText) items.push(itemText);
            i++;
          }
          if (items.length > 0) {
            elements.push(
              <ul key={k++} className="md-ul">
                {items.map((item, ii) => (
                  <li key={ii} className="md-li">
                    <span className="md-li-dot" />
                    <span>{renderInline(item, `ul${k}-${ii}`, isUserMsg)}</span>
                  </li>
                ))}
              </ul>,
            );
          }
          continue;
        }

        // Ordered list 1.
        if (/^\s*\d+\.\s/.test(line)) {
          const items = [];
          let startNum = parseInt(/^(\d+)\./.exec(line.trim())[1]);
          while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
            const itemText = lines[i].replace(/^\s*\d+\.\s/, "").trim();
            if (itemText) items.push(itemText);
            i++;
          }
          if (items.length > 0) {
            elements.push(
              <ol key={k++} className="md-ol" start={startNum}>
                {items.map((item, ii) => (
                  <li key={ii} className="md-li md-ol-li">
                    <span className="md-li-num">{startNum + ii}.</span>
                    <span>{renderInline(item, `ol${k}-${ii}`, isUserMsg)}</span>
                  </li>
                ))}
              </ol>,
            );
          }
          continue;
        }

        // Plain paragraph — chỉ render nếu line có nội dung thật
        const trimmedLine = line.trim();
        if (trimmedLine) {
          elements.push(
            <p key={k++} className="md-p">
              {renderInline(trimmedLine, `p${k}`, isUserMsg)}
            </p>,
          );
        }
        i++;
      }

      return elements.length > 0 ? (
        <div className="md-body">{elements}</div>
      ) : (
        <React.Fragment>{text}</React.Fragment>
      );
    } catch {
      return <React.Fragment>{text}</React.Fragment>;
    }
  };

  return (
    <Box className="ai-chat-root">
      {/* Floating Chat Trigger Button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        className={`ai-chat-trigger ${isOpen ? "open" : ""}`}
        sx={{
          background:
            "linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)",
          boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
          color: "white",
          width: 58,
          height: 58,
          "&:hover": {
            transform: "scale(1.08) translateY(-2px)",
            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.6)",
          },
          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {isOpen ? (
          <Close sx={{ fontSize: 28 }} />
        ) : (
          <AutoAwesome className="glowing-sparkle" sx={{ fontSize: 28 }} />
        )}
      </IconButton>

      {/* Chat Window Panel */}
      <Paper
        elevation={8}
        className={`ai-chat-panel ${isOpen ? "active" : ""}`}
        sx={{
          borderRadius: "18px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          width: { xs: "330px", sm: "380px" },
          height: { xs: "460px", sm: "520px" },
          transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        }}
      >
        {/* Panel Header */}
        <Box className="chat-header">
          <Box className="chat-header-info">
            <Avatar
              sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 36, height: 36 }}
            >
              <SupportAgent sx={{ color: "#c084fc" }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="chat-header-title">
                Trợ lý ảo LabLab
              </Typography>
              <Box className="online-badge-container">
                <span className="online-dot" />
                <Typography variant="caption" className="chat-header-status">
                  Trực tuyến
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className="chat-header-actions">
            <Tooltip title="Xóa lịch sử chat">
              <IconButton
                size="small"
                onClick={handleClearChat}
                sx={{ color: "white" }}
              >
                <DeleteSweep fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: "white" }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Message Content Area */}
        <Box className="chat-messages">
          {messages.map((msg) => (
            <Box key={msg.id} className={`message-row ${msg.sender}`}>
              {msg.sender === "ai" && (
                <Avatar
                  className="msg-avatar"
                  sx={{ width: 28, height: 28, bgcolor: "#f3e8ff" }}
                >
                  <SmartToy sx={{ fontSize: 16, color: "#a855f7" }} />
                </Avatar>
              )}
              <Box className={`message-bubble ${msg.sender}`}>
                <Typography variant="body2" className="message-text">
                  {renderText(msg.text, msg.sender === "user")}
                </Typography>
                <Typography variant="caption" className="message-time">
                  {msg.timestamp}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <Box className="message-row ai">
              <Avatar
                className="msg-avatar"
                sx={{ width: 28, height: 28, bgcolor: "#f3e8ff" }}
              >
                <SmartToy sx={{ fontSize: 16, color: "#a855f7" }} />
              </Avatar>
              <Box className="message-bubble ai typing">
                <Box className="typing-dots">
                  <span />
                  <span />
                  <span />
                </Box>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Dynamic Suggestion Chips */}
        <Box className="chat-suggestions-container">
          <Typography variant="caption" className="suggestion-label">
            Gợi ý cho bạn:
          </Typography>
          <Box className="chat-suggestions">
            {userSuggestions.map((sug, i) => (
              <Chip
                key={i}
                label={sug.label}
                onClick={() => handleSend(sug.query)}
                variant="outlined"
                size="small"
                className="suggestion-chip"
                sx={{
                  borderColor: "#e2e8f0",
                  "&:hover": {
                    backgroundColor: "#f5f3ff",
                    borderColor: "#c084fc",
                    color: "#7c3aed",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Input Area */}
        <Box className="chat-input-area">
          <TextField
            fullWidth
            size="small"
            placeholder="Nhập câu hỏi của bạn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim()}
                    color="primary"
                    size="small"
                    sx={{
                      color: inputValue.trim() ? "#6366f1" : "#cbd5e1",
                      transition: "color 0.2s",
                    }}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
                backgroundColor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
