import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import Link from '@mui/material/Link';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import ErrorIcon from '@mui/icons-material/Error';
import AnimLoadingComponent from './AnimLoadingComponent';
import ReqRespIconButton from './ReqRespIconButton';
import { PENDING_STATE, SUCCESS_STATE, FAILURE_STATE } from './utils/constants';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { unstable_useTreeItem2 as useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { subscribeToUpdates, unsubscribe, durationToString } from './utils/api';

import { Button, Container, Box, Typography, AppBar, Toolbar, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; 

import BugReportIcon from '@mui/icons-material/BugReport';
import CancelIcon from '@mui/icons-material/Cancel';

  

const ITEMS = [
  {
    id: '1',
    label: JSON.stringify({
        queryId: 1,
        callId: 1,
        state: 'SUCCESS',
        url: 'http://test1.org',
        duration: 125,
        responseItemCount: 4,
        httpStatus: 200,    
    }),
    children: [{ id: '2', 
                label: JSON.stringify({
                    queryId: 1,
                    callId: 2,
                    state: 'SUCCESS',
                    url: 'http://test1.org',
                    duration: 125,
                    responseItemCount: 4,
                    httpStatus: 200
                })
               }],
  }
];


const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({
    backgroundColor: '#007800',
    color: '#ffffff',
    borderRadius: '50%'   
  });
  
  const StyledErrorIcon = styled(ErrorIcon)({
    color: '#aa0000'  
  });      

  const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
  }));
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
    const { id, itemId, label, disabled, children, ...other } = props;
  
    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    const nodeContent = JSON.parse(label)

    const getIconComponent = () => {
      switch (nodeContent.state) {
        case PENDING_STATE:
          return <AnimLoadingComponent />;
        case SUCCESS_STATE:
          return <StyledDoneRoundedIcon />;
        case FAILURE_STATE:
          return <StyledErrorIcon />;
        default:
          return null;
      }
    };  

  
    return (

      <TreeItem2Provider itemId={itemId}>
        <TreeItem2Root {...getRootProps(other)}>
          <CustomTreeItemContent {...getContentProps()}>
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>

            <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
              {getIconComponent()}
              <Typography variant="body2" sx={{ ml: 1 }}>{nodeContent.httpStatus}</Typography>
              <Typography variant="body2" sx={{ flexGrow: 1, ml: 1 }}>
                <Link href={nodeContent.endpoint} target="_blank" rel="noopener noreferrer">{nodeContent.endpoint}</Link>
              </Typography>
              <ReqRespIconButton queryId={nodeContent.queryId} nodeId={nodeContent.nodeId} isRequest={true} />
              {nodeContent.state !== PENDING_STATE && <ReqRespIconButton queryId={nodeContent.queryId} nodeId={nodeContent.nodeId} isRequest={false} />}
              
              {nodeContent.duration && <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                    {nodeContent.duration}
              </Typography>
              }

              {nodeContent.responseItemCount && <Typography variant="body2" sx={{ ml: 1 }}>{nodeContent.responseItemCount}</Typography>}
            </Box>


          </CustomTreeItemContent>
          {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
        </TreeItem2Root>
      </TreeItem2Provider>
    );
  });
  

  const DebugTreeView = forwardRef(({ endpoint, query, setQueryIsRunning}, ref) => {

    const [treeData, setTreeData] = useState({});
    const [treeRenderData, setTreeRenderData] = useState([]);
    const [expandedItems, setExpandedItems] = useState([]);

    useImperativeHandle(ref, () => ({
      handleExecuteQuery
    }));

    const handleExpandedItemsChange = (event, itemIds) => {
      setExpandedItems(itemIds);
    };  
    
    const handleExecuteQuery = async () => {
      unsubscribe();
      setTreeData({});
    
      const params = {
        endpoint: `${endpoint}`,
        query: `${query}`
      }
    
      subscribeToUpdates(params, setTreeData, setTreeRenderData, setExpandedItems, setQueryIsRunning);
    
    };
    
    return (
      <Box sx={{ minHeight: 180, flexGrow: 1, maxWidth: 400 }}>
        <RichTreeView
          aria-label="icon expansion"
          sx={{ position: 'relative' }}
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}          
          items={treeRenderData}
          slots={{ item: CustomTreeItem }}
        />
      </Box>
    );
});

const SparqlDebugger = ({ theme, query, endpoint, updateQueryInfo }) => {
  const debugTreeViewRef = useRef(null);
  const [queryIsRunning, setQueryIsRunning] = useState(false)

  const handleDebugClick = () => {
    if(queryIsRunning) {
      debugTreeViewRef.current.handleStopQuery()
      setQueryIsRunning(false)
    } else {
      updateQueryInfo()
      setTimeout(() => {
        if (debugTreeViewRef.current) {
          debugTreeViewRef.current.handleExecuteQuery();
        }
      }, 0);  
      setQueryIsRunning(true)
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box my={4} textAlign="center">
          <Button variant="contained" onClick={handleDebugClick}
              color={queryIsRunning ?  'error' : 'success'}
              startIcon={queryIsRunning ?  <CancelIcon /> : <BugReportIcon />}
            >
            {queryIsRunning ? 'Cancel' : 'Debug'}
          </Button>
        </Box>
        <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>          
          <DebugTreeView endpoint={endpoint} query={query} setQueryIsRunning={setQueryIsRunning} ref={debugTreeViewRef}/>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default SparqlDebugger