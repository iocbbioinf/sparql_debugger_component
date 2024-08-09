import axios from "axios";
import {PENDING_STATE, SUCCESS_STATE, FAILURE_STATE, baseUrl, HTML_SUFFIX, XML_SUFFIX, JSON_SUFFIX, TEXT_SUFFIX} from "./constants"
import { v4 as uuidv4 } from "uuid";

let eventSource = null;
let queryId = null;

export const subscribeToUpdates = (params, setTreeData, setRenderData, setExpandedItems, setQueryIsRunning) => {
  const encodedParams = Object.keys(params)
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    })
    .join("&");

    
  const fullUrl = `${baseUrl}/query?${encodedParams}`;

  console.log(fullUrl);

  eventSource = new EventSource(fullUrl);

  eventSource.onmessage = function (event) {
    console.log("New event from server:", event.data);

    const eventData = JSON.parse(event.data);
    queryId = eventData.queryId;

    setTreeData((prevState) =>
      refreshTree(prevState, eventData, setExpandedItems)
    );

    setTreeData((prevState) => {
      if(prevState.root.data.state !== PENDING_STATE) {
        setQueryIsRunning(false);
      }
      return prevState;
    });

    setTreeData((prevState) => {
      setRenderData([refreshRenderTree(addBulkNodes(prevState))]);
      return prevState;
    });

  };  

  eventSource.onerror = function (err) {
    console.error("EventSource failed:", err);
    eventSource.close();
  };
};

export const unsubscribe = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};


export const durationToString = (durationInMillis) => {
  if (durationInMillis) {
    const seconds = Math.floor((durationInMillis / 1000) % 60);
    const minutes = Math.floor((durationInMillis / (1000 * 60)) % 60);
    const hours = Math.floor(durationInMillis / (1000 * 60 * 60));

    let formattedDuration = '';

    if(seconds > 0 || minutes > 0 || hours > 0) {
      formattedDuration = `${seconds}s`;
    } else {
      formattedDuration = `${durationInMillis}ms`;
    }    


    if (minutes > 0 || hours > 0) {
      formattedDuration = `${minutes}m ` + formattedDuration;
    }
    if (hours > 0) {
      formattedDuration = `${hours}h ` + formattedDuration;
    }        

    return formattedDuration;
  }

  return "";
};

function refreshTree(treeData, newNode, setExpandedItems) {
  var updated = false;

  function refreshTreeRek(node) {
    if (node.data.nodeId === newNode.nodeId) {
      updated = true;
      return { ...node, data: newNode };
    }

    var result;
    if (node.children) {
      result = {
        data: { ...node.data },
        children: node.children.map((child) => refreshTreeRek(child)),
      };
    }

    if (updated === false && node.data.nodeId === newNode.parentNodeId) {
      setExpandedItems((oldState) => [...oldState, newNode.nodeId.toString()]);
      result = {
        data: { ...node.data },
        children: [...(node.children ? node.children : []), { data: newNode }],
      };
    }

    result = result || node;

    return result;
  }

  if (treeData.root) {
    var result = { root: refreshTreeRek(treeData.root) };
    return result;
  } else {
    setExpandedItems((oldState) => [...oldState, newNode.nodeId.toString()]);
    return { root: { data: newNode } };
  }
}

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {

    (rv[(x["data"])[key]] = rv[(x["data"])[key]] || []).push(x);
    return rv;
  }, {});
};


function addBulkNodes(treeData) {
  if (!treeData || !Object.keys(treeData).length ) return [];

  if (treeData.root) {
    return { root: addBulkNodes(treeData.root) };
  }

  if(treeData.children) {
    const childGroup = groupBy(treeData.children, "serviceCallId");

    const childMultiGroup = Object.values(childGroup).filter(x => x.length > 1);
  
    const bulkChildrenNodes = Object.values(childMultiGroup).map(x => {
      var bulkState;
      if(treeData.data.state != PENDING_STATE) {
        if(x.every((child) => child.data.state == SUCCESS_STATE)) {
          bulkState = SUCCESS_STATE;
        } else {
          bulkState = FAILURE_STATE;
        }
      } else {
        bulkState = PENDING_STATE
      }

      const tmp1 = x.map(child => child.data.endTime);
      const tmp2 = x.map(child => child.data.endTime).filter(time => time != null);
      const tmp3 = Math.max(x.map(child => child.data.endTime).filter(time => time != null));
      const tmp4 = Math.max(...x.map(child => child.data.startTime).filter(time => time != null));

      const duration = Math.max(...x.map(child => child.data.endTime).filter(time => time != null)) - Math.min(...x.map(child => child.data.startTime).filter(time => time != null));
            
      return {
        data: {nodeId: uuidv4(), isBulk: true, bulkSize: x.length, endpoint: x[0].data.endpoint, state: bulkState, duration: duration}, 
        children: x.map((child) => addBulkNodes(child))
      }
  })  
  
    const childSingleGroup = Object.values(childGroup).filter(x => x.length === 1).flat();
    const singleChildrenNodes = Object.values(childSingleGroup).map((child) => addBulkNodes(child));
  
    const result = { 
      data: { ...treeData.data },
      children: bulkChildrenNodes.concat(singleChildrenNodes)
    }  
    return result;

  } else {
    return treeData;
  }

}

function refreshRenderTree(bulkTreeData) {
  if (!bulkTreeData || !Object.keys(bulkTreeData).length ) return [];

  if (bulkTreeData.root) {
    return refreshRenderTree(bulkTreeData.root)
  }

  const result = {
    id: bulkTreeData.data.nodeId.toString(),
    label: JSON.stringify(bulkTreeData.data),
    children: bulkTreeData.children ? bulkTreeData.children.map((child) => refreshRenderTree(child)) : []
  }

  return result;
}

export const deleteQuery = () => {
  if(queryId) {
    const fullUrl = `${baseUrl}/query/${queryId}/delete`;  
    axios.post(fullUrl);
  }
}

export const cancelQuery = () => {
  if(queryId) {
    const fullUrl = `${baseUrl}/query/${queryId}/cancel`;  
    axios.post(fullUrl);
  }
}