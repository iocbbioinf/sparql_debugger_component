import React, { useState, useCallback } from 'react';
import { IconButton, Tooltip, Modal, Box, Button } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import { saveAs } from 'file-saver';
import modalStyle from './styles/modalStyle'; 
import { baseUrl } from "./utils/constants";
import JSONPretty from 'react-json-pretty';


function ReqRespIconButton({ queryId, nodeId, isRequest }) {
  const [open, setOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileBlob, setFileBlob] = useState(null);

  const PREVIEW_LENGTH = 2000;

  const fetchPreviewContent = useCallback(async (queryId, callId, isRequest) => {
    const reqResp = isRequest ? "request" : "response";
    const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Accept-Encoding': 'gzip,deflate',
          'Range': `bytes=0-${PREVIEW_LENGTH - 1}`
        }
      });

      const blob = await response.blob();
      
      const text = await blob.text();

      if(text.length >= PREVIEW_LENGTH - 1) {
        setFileContent(text + "...");
      } else {
        setFileContent(text);
      }

    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContent("File not found or could not be loaded.");  
    }
  }, []);

  const fetchFileContent = useCallback(async (queryId, callId, isRequest) => {
    try {
      const reqResp = isRequest ? "request" : "response";
      const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;

      const response = await fetch(fullUrl, {
        headers: {
          'Accept-Encoding': 'gzip,deflate'
        }
      });
      
      const blob = await response.blob();

      setFileBlob(blob);

      const fileName = `${queryId}_${callId}_${reqResp}.tmp`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  }, []);


  const handleOpen = (event) => {
    fetchPreviewContent(queryId, nodeId, isRequest);
    setOpen(true);
    event.stopPropagation();
  };

  const handleClose = (event) => {
    setOpen(false);
    event.stopPropagation();
  };

  const handleDownload = (event) => {
    fetchFileContent(queryId, nodeId, isRequest);
    event.stopPropagation();
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
          <Button onClick={handleDownload} variant="contained" color="primary" style={{ marginTop: '10px' }}>
            Download
          </Button>
          <JSONPretty id="json-pretty" data={fileContent} theme={JSONPretty.monikai}></JSONPretty>
        </Box>
      </Modal>
    </div>
  );
}

export default ReqRespIconButton;
