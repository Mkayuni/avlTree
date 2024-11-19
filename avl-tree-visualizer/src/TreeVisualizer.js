import React, { useRef } from 'react';
import { animated } from '@react-spring/web';

// Function to calculate the balance factor of a node
const calculateBalanceFactor = (node) => {
  if (!node) return 0;
  const leftHeight = node.left ? node.left.height : 0;
  const rightHeight = node.right ? node.right.height : 0;
  return leftHeight - rightHeight;
};

const TreeVisualizer = ({ data, balancedNode, childNodes, highlightedNode }) => {
  const svgRef = useRef();

  // Recursive function to render the tree
  const renderTree = (node, x, y, level) => {
    if (!node) return null;

    const leftX = x - 100 / level;
    const rightX = x + 100 / level;
    const childY = y + 100;

    const balanceFactor = calculateBalanceFactor(node);

    // Determine the fill color for the current node
    let fillColor = 'steelblue';

    // Highlight unbalanced nodes in red
    if (balanceFactor < -1 || balanceFactor > 1) {
      fillColor = 'red';
    }
    // Highlight immediate children of the balanced node in green
    if (childNodes && childNodes.some(child => child && child.data === node.data)) {
      fillColor = 'green';
    }
    // Highlight the node that will be balanced next in orange
    else if (balancedNode && node.data === balancedNode.data) {
      fillColor = 'orange';
    }
    // Highlight the searched node in yellow
    else if (highlightedNode === node.data) {
      fillColor = 'yellow';
    }

    return (
      <>
        {/* Draw the current node */}
        <animated.circle
          cx={x}
          cy={y}
          r={20}
          fill={fillColor}
          stroke="black"
          strokeWidth={2}
        />
        {/* Display the node's data */}
        <text x={x - 10} y={y + 5} textAnchor="middle" fill="white">
          {node.data}
        </text>

        {/* Display the balance factor */}
        <text x={x + 30} y={y} fontSize="12" fill="green">
          BF: {balanceFactor}
        </text>

        {/* Draw the left child and the connecting line */}
        {node.left && (
          <>
            <line x1={x} y1={y} x2={leftX} y2={childY} stroke="gray" />
            {renderTree(node.left, leftX, childY, level + 1)}
          </>
        )}

        {/* Draw the right child and the connecting line */}
        {node.right && (
          <>
            <line x1={x} y1={y} x2={rightX} y2={childY} stroke="gray" />
            {renderTree(node.right, rightX, childY, level + 1)}
          </>
        )}
      </>
    );
  };

  return (
    <svg
      ref={svgRef}
      width={800}
      height={600}
      style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}
    >
      {renderTree(data, 400, 50, 1)}
    </svg>
  );
};

export default TreeVisualizer;
