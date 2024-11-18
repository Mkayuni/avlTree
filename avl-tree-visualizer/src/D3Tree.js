import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreeNode, insert } from './avlTree';


const D3Tree = ({ data, animationSpeed, rotationInfo = { type: '', node: null, x: 0, y: 0 } }) => {
  const svgRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [treeData, setTreeData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playTimeoutRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [lines, setLines] = useState([]);
  const [svgKey, setSvgKey] = useState(0); // New key state
  const [balanceAfterDelay, setBalanceAfterDelay] = useState(false);

  let commandQueue = [];
  let isRunning = false;
  
  const addCommand = (command) => {
    commandQueue.push(command);
    if (!isRunning) executeCommands();
  };
  
  const executeCommands = () => {
    if (commandQueue.length === 0) {
      isRunning = false;
      return;
    }
    isRunning = true;
    const command = commandQueue.shift();
    command();
    setTimeout(executeCommands, 1000); // Adjust delay as needed (currently 1 second)
  };
  

  useEffect(() => {
    if (!data) {
      setTreeData(null);
      setCurrentStep(0);
      setIsPlaying(false);
      setNodes([]);
      setLines([]);
      return;
    }
    setTreeData(data);
    setCurrentStep(0);
    setIsPlaying(false);
    updateTree();
  }, [data]);

  const calculateBalanceFactor = (node) => {
    if (!node) return 0;
    const leftHeight = node.left ? node.left.height : 0;
    const rightHeight = node.right ? node.right.height : 0;
    return leftHeight - rightHeight;
  };

  const handleInsertWithDelay = async (data) => {
    if (!treeData) {
      const newTree = new TreeNode(data);
      setTreeData(newTree);
      updateTree();
      return;
    }
  
    // Step 1: Insert node without balancing
    const newTree = insert(treeData, data, [], [], [], rotationInfo, false);
    setTreeData(newTree);
  
    // Step 2: Render the unbalanced tree
    updateTree();
  
    // Step 3: Introduce a delay to display the unbalanced state
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait for 1.5 seconds
  
    // Step 4: Balance the tree after the delay
    const balancedTree = insert(newTree, data, [], [], [], rotationInfo, true);
    setTreeData(balancedTree);
    updateTree(); // Render the balanced tree
  };
  

  const getTreeNodes = (node, x = 400, y = 50, level = 1, nodes = [], maxDepth = 1) => {
    if (!node) return nodes;
  
    // Calculate the balance factor of the current node
    const balanceFactor = calculateBalanceFactor(node);
  
    // Adjust horizontal offset dynamically based on the level and depth
    const dynamicOffset = 200 / Math.pow(2, level); // Adjust based on level depth
    
    nodes.push({
      value: node.data,
      x,
      y,
      balanceFactor,
      isRotating: rotationInfo.node === node.data,
      isProblematic: balanceFactor < -1 || balanceFactor > 1,
    });
  
    getTreeNodes(node.left, x - dynamicOffset, y + 40, level + 1, nodes, maxDepth);
    getTreeNodes(node.right, x + dynamicOffset, y + 40, level + 1, nodes, maxDepth);
  
    return nodes;
  };

  const getTreeLines = (node, x = 400, y = 50, level = 1, lines = []) => {
    if (!node) return lines;
    const offsetX = 400 / (level + 1);
    if (node.left) {
      lines.push({ x1: x, y1: y, x2: x - offsetX, y2: y + 70 });
      getTreeLines(node.left, x - offsetX, y + 70, level + 1, lines);
    }
    if (node.right) {
      lines.push({ x1: x, y1: y, x2: x + offsetX, y2: y + 70 });
      getTreeLines(node.right, x + offsetX, y + 70, level + 1, lines);
    }
    return lines;
  };

  const updateTree = () => {
    if (!treeData) return;
  
    // Convert treeData into a hierarchy structure
    const root = d3.hierarchy(treeData, (d) => [d.left, d.right].filter(Boolean));
  
    // Calculate the maximum depth and width of the tree
    const maxDepth = root.height;
    const nodeCount = root.descendants().length;
  
    // Dynamically adjust tree size based on depth and number of nodes
    const width = Math.max(400, nodeCount * 50);
    const height = Math.max(100, (maxDepth + 1) * 50);
  
    // Use D3 tree layout with dynamic size and separation
    const treeLayout = d3.tree()
        .size([width, height])
        .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));
  
    treeLayout(root);
  
    // Adjust positions for nodes with a single child to differentiate left/right
    root.descendants().forEach((node) => {
        if (node.children && node.children.length === 1) {
            const child = node.children[0];
            if (node.data.left === child.data) {
                child.x -= 40; // Move left child slightly to the left
            } else if (node.data.right === child.data) {
                child.x += 40; // Move right child slightly to the right
            }
        }
    });
  
    // Extract nodes with updated positions
    const newNodes = root.descendants().map((d) => ({
        value: d.data.data,
        x: d.x,
        y: d.y,
        balanceFactor: calculateBalanceFactor(d.data),
        isRotating: rotationInfo.node === d.data.data,
        isProblematic: calculateBalanceFactor(d.data) < -1 || calculateBalanceFactor(d.data) > 1,
    }));
  
    // Extract lines between nodes
    const newLines = root.links().map((link) => ({
        x1: link.source.x,
        y1: link.source.y,
        x2: link.target.x,
        y2: link.target.y,
    }));
  
    setNodes(newNodes);
    setLines(newLines);
};

  const stepForward = () => {
    if (!treeData) return;
    const root = d3.hierarchy(treeData, (d) => [d.left, d.right].filter(Boolean));
    if (currentStep < root.descendants().length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Function to clear the SVG content
  const clearSVG = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();
    }
  };

  const resetTree = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    clearTimeout(playTimeoutRef.current);

    // Clear the tree data
    setTreeData(null);
    setNodes([]);
    setLines([]);

    // Directly clear the SVG content
    if (svgRef.current) {
        svgRef.current.innerHTML = ''; // Similar to the Mermaid approach
    }

    // Reset the rotation info
    rotationInfo.type = '';
    rotationInfo.node = null;

    // Trigger a re-render by resetting the tree data
    setTimeout(() => {
        updateTree();
    }, 0);
};

  const playSteps = () => {
    setIsPlaying(true);
    const play = () => {
      const root = d3.hierarchy(treeData, (d) => [d.left, d.right].filter(Boolean));
      if (currentStep < root.descendants().length - 1) {
        stepForward();
        playTimeoutRef.current = setTimeout(play, 1000 / (playbackSpeed * animationSpeed));
      } else {
        setIsPlaying(false);
        clearTimeout(playTimeoutRef.current);
      }
    };
    play();
  };

  const stopPlaying = () => {
    setIsPlaying(false);
    clearTimeout(playTimeoutRef.current);
  };

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
  
      // Clear any existing zoom behavior to prevent duplication
      svg.call(d3.zoom().on('zoom', null));
  
      // Create a group inside the SVG for zooming
      let svgGroup = svg.select('g');
      if (svgGroup.empty()) {
        svgGroup = svg.append('g');
      }
  
      // Add zoom behavior
      const zoomHandler = d3.zoom()
        .scaleExtent([0.5, 2]) // Set zoom limits (min and max zoom)
        .on('zoom', (event) => {
          svgGroup.attr('transform', event.transform);
        });
  
      svg.call(zoomHandler);
    }
  }, [treeData]);
  

  useEffect(() => {
    if (treeData) {
      updateTree();
    }
  }, [treeData, currentStep, animationSpeed, rotationInfo]);

  // Automatically scale and fit the tree into the SVG container
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = svg.select('.zoom-group');

    if (!g.empty()) {
      // Get the bounding box of all nodes
      const bbox = g.node().getBBox();
      
      // Calculate the scale to fit the tree within the container
      const scaleX = 800 / bbox.width;
      const scaleY = 600 / bbox.height;
      const scale = Math.min(scaleX, scaleY) * 0.9; // Add some padding

      // Calculate translation to center the tree
      const translateX = (800 - bbox.width * scale) / 2 - bbox.x * scale;
      const translateY = (600 - bbox.height * scale) / 2 - bbox.y * scale;

      // Apply the transform to the group element
      g.attr('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
    }
  }, [nodes, lines]);

  return (
    <div>
      <svg key={svgKey} ref={svgRef} width={800} height={600} style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        {/* Define arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L10,3.5 L0,7" fill="black" />
          </marker>
        </defs>
  
        <g className="zoom-group">
          {lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="black"
              strokeWidth="2"
              markerEnd="url(#arrowhead)" // Add arrow marker here
            />
          ))}
  
          {nodes.map((node, index) => (
            <g key={node.value} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                cx={0}
                cy={0}
                r="20"
                fill={node.isProblematic ? 'red' : node.isRotating ? 'orange' : 'lightblue'}
                stroke={node.value === rotationInfo.node ? 'red' : 'black'}
                strokeWidth={node.isRotating ? 3 : 1}
              />
              <text x={0} y={5} textAnchor="middle" alignmentBaseline="middle">{node.value}</text>
              <text x={25} y={5} fontSize="12" fill="green">BF: {node.balanceFactor}</text>
            </g>
          ))}
        </g>
      </svg>
  
      {/* New Input Field and Button for Inserting Nodes */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <input
          type="number"
          id="nodeValue"
          placeholder="Enter value"
          style={{ marginRight: '10px' }}
        />
        <button
          onClick={() => {
            const value = parseInt(document.getElementById('nodeValue').value, 10);
            if (!isNaN(value)) {
              handleInsertWithDelay(value);
            }
          }}
        >
          Insert Node
        </button>
      </div>
  
      {/* Control Buttons */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={stepBackward} disabled={isPlaying}>Skip Back</button>
        <button onClick={stepForward} disabled={isPlaying}>Next Step</button>
        <button onClick={playSteps} disabled={isPlaying}>Play</button>
        <button onClick={stopPlaying} disabled={!isPlaying}>Stop</button>
        <select onChange={(e) => setPlaybackSpeed(Number(e.target.value))} value={playbackSpeed}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
  
};

export default D3Tree;
