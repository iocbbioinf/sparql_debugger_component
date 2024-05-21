import axios from "axios";

const baseUrl = "http://idsm-debugger-test6.dyn.cloud.e-infra.cz";

let eventSource = null;

export const subscribeToUpdates = (params, setTreeData, setExpandedItems) => {
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

    setTreeData((prevState) =>
      refreshTree(prevState, JSON.parse(event.data), setExpandedItems)
    );
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

export const fetchFileContent = async (queryId, callId, isRequest) => {
  try {
    const reqResp = isRequest ? "request" : "response";
    const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching file content:", error);
    return "File not found or could not be loaded.";
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
