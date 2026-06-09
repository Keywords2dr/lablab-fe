import React from "react";
import { CheckCircleOutlined } from "@mui/icons-material";

export default function StepDot({ num, status }) {
  return (
    <div className={`stp-dot stp-dot--${status}`}>
      {status === "done" ? (
        <CheckCircleOutlined style={{ fontSize: 14 }} />
      ) : (
        num
      )}
    </div>
  );
}
