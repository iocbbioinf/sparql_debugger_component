import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import StyledTreeItem from './StyledTreeItem';
import { subscribeToUpdates, unsubscribe, durationToString } from './utils/api';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const DebugTreeView = forwardRef(({ endpoint, query, treeStyles }, ref) => {
  const [treeData, setTreeData] = useState({});
  const [expandedItems, setExpandedItems] = useState([]);

  useImperativeHandle(ref, () => ({
    handleExecuteQuery
  }));

  const handleExecuteQuery = async () => {
      unsubscribe();
      setTreeData({});

      const params = {
        endpoint: `${endpoint}`,
        query: `${query}`
      }

      subscribeToUpdates(params, setTreeData, setExpandedItems);
  };

  const renderTree = (node) => (
    (!node || !node.data || node.data.nodeId === undefined) ? null :
      <StyledTreeItem nodeId={node.data.nodeId.toString()} itemID={node.data.nodeId.toString()} key={node.data.nodeId.toString()} queryId={node.data.queryId.toString()} 
        callId={node.data.nodeId.toString()} state={node.data.state} url={node.data.endpoint} duration={durationToString(node.data.duration)} httpStatus={node.data.httpStatus}>
          {Array.isArray(node.children) ? node.children.map((child) => renderTree(child)) : null}
      </StyledTreeItem>
  );

  useEffect(() => {
    const params = { endpoint, query };

    const updateTreeData = (newTreeData) => {
      setTreeData(newTreeData);
    };

    subscribeToUpdates(params, updateTreeData, setExpandedItems);

    return () => {
      unsubscribe();
    };
  }, [endpoint, query]);

  return (
    
    <div>
      <TreeView
        aria-label="debug-tree"
        expanded={expandedItems}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        sx={{ ...treeStyles, overflowY: 'auto' }}
      >
        {treeData.root && renderTree(treeData.root)}
      </TreeView>
    </div>
  );
});

export default DebugTreeView;
