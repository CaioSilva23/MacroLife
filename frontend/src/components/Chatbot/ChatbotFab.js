import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { SmartToy as ChatIcon } from '@mui/icons-material';
import ChatbotComponent from './ChatbotComponent';

const ChatbotFab = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Tooltip title="Assistente Nutricional" placement="left">
        <Fab
          color="secondary"
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <ChatbotComponent
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
};

export default ChatbotFab;
