import React, { useState } from 'react';
import { IconButton, Tooltip, Modal, Box } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import JSONPretty from 'react-json-pretty';
import modalStyle from './styles/modalStyle'; 

import axios from "axios";
import {baseUrl} from "./utils/constants"

function ReqRespIconButton({ queryId, nodeId, isRequest }) {
  const [open, setOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');


  const fetchFileContent = (queryId, callId, isRequest) => {
    try {
      const reqResp = isRequest ? "request" : "response";
      const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;
      axios.get(fullUrl).then(response => {setFileContent(response.data)})
    } catch (error) {
      console.error("Error fetching file content:", error);
      return "File not found or could not be loaded.";
    }
  };
  
  const handleOpen =  (event) => {
    fetchFileContent(queryId, nodeId, isRequest);
    setOpen(true);
    event.stopPropagation();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const icon = isRequest ? <InputIcon /> : <OutputIcon />;
  const iconTitle = isRequest ? "Request" : "Response";

  return (
    <div>
      <Tooltip title={iconTitle}>
        <IconButton onClick={handleOpen} aria-label={iconTitle}>
          {icon}
        </IconButton>
      </Tooltip>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <JSONPretty id="json-pretty" data={fileContent} theme={JSONPretty.monikai}></JSONPretty>
        </Box>
      </Modal>
    </div>
  );
}

export default ReqRespIconButton;