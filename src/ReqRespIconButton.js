import React, { useState, useCallback } from 'react';
import { IconButton, Tooltip, Modal, Box, Button } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import { saveAs } from 'file-saver';
import modalStyle from './styles/modalStyle'; 
import { baseUrl } from "./utils/constants";
import JSONPretty from 'react-json-pretty';
import DownloadIcon from '@mui/icons-material/Download';
import './styles/debugStyles.css'; 

function ReqRespIconButton({ queryId, nodeId, isRequest, resultType }) {
  const [open, setOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileBlob, setFileBlob] = useState(null);

  const PREVIEW_LENGTH = 2000;

  const fetchPreviewContent = useCallback(async (queryId, callId, isRequest) => {
    const reqResp = isRequest ? "request" : "response";
    const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;

    const actualPreviewLength = resultType && resultType.toLowerCase() === "html" ? 200000 : PREVIEW_LENGTH;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Accept-Encoding': 'gzip,deflate',
          'Range': `bytes=0-${actualPreviewLength - 1}`
        },
        'credentials': 'include'
      });

      const blob = await response.blob();
      
      const text = await blob.text();

      if(text.length >= actualPreviewLength - 1) {
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
        },
        'credentials': 'include'
      });
      
      const blob = await response.blob();

      setFileBlob(blob);

      const postfix = resultType ? resultType : "txt"
      const fileName = `${queryId}_${callId}_${reqResp}.${postfix}`;
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

  const JSONPrettyWrapper = ({ data, resultType }) => {
    const isJsonOrXml = (resultType) => {
        if (resultType && resultType.toLowerCase === "json" || resultType === "xml") {
          return true;
        } 
        return false;
      }

    return isJsonOrXml(resultType) ? (
      <JSONPretty id="json-pretty" data={data} theme={JSONPretty.monikai} className="json-pretty"></JSONPretty>
    ) : (
      <pre>{data}</pre>
    );
  };
  

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
        <Box sx={modalStyle} className="modal-content">
          <Button
              onClick={handleDownload}
              variant="contained"
              startIcon={<DownloadIcon />}
              className="fancy-button"
            >
              Download
            </Button>

            {resultType && resultType.toLowerCase() === "html" ? (
            <div             
              style={{
                flex: 1, // Make the content take up remaining space
                maxHeight: '70vh',
                overflowY: 'auto',
                overflowX: 'auto',
                padding: '1rem', // Add padding for better spacing
              }}

              dangerouslySetInnerHTML={{ __html: fileContent }}
              className="html-preview"              
            />
          ) : ( 
            <JSONPrettyWrapper data={fileContent} resultType={resultType}/>
          )}

          
        </Box>
      </Modal>
    </div>
  );
}

export default ReqRespIconButton;
