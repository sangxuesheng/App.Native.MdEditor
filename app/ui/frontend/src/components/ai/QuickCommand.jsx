import React from 'react'

export default function QuickCommand({ command, onClick, disabled }) {
  return (
    <button
      className="quick-command-btn"
      onClick={onClick}
      disabled={disabled}
      title={command.template}
    >
      <span className="command-icon">{command.icon}</span>
      <span className="command-label">{command.label}</span>
    </button>
  )
}
