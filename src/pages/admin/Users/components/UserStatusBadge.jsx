import React from 'react';

const UserStatusBadge = ({ isActive }) => {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                border: '1px solid transparent',
                background: isActive ? '#f0fdf4' : '#fef2f2',
                color: isActive ? '#16a34a' : '#dc2626',
                borderColor: isActive ? '#bbf7d0' : '#fecaca',
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isActive ? '#22c55e' : '#ef4444',
                    display: 'inline-block',
                    flexShrink: 0,
                }}
            />
            {isActive ? 'Hoạt động' : 'Đã khóa'}
        </span>
    );
};

export default UserStatusBadge;