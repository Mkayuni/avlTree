import React, { useEffect, useRef } from 'react';
import { animated } from '@react-spring/web';

// Function to calculate the balance factor of a node
const calculateBalanceFactor = (node) => {
  if (!node) return 0;
  const leftHeight = node.left ? node.left.height : 0;
  const rightHeight = node.right ? node.right.height : 0;
  return leftHeight - rightHeight;
};

// Updated TreeVisualizer component
const TreeVisualizer = ({ data }) => {
  const svgRef = useRef();

  // Function to render the AVL tree with balance factors
  const renderTree = (node, x, y, level) => {
    if (!node) return null;

    // Calculate positions for child nodes
    const leftX = x - 100 / level;
    const rightX = x + 100 / level;
    const childY = y + 100;

    // Calculate the balance factor for the current node
    const balanceFactor = calculateBalanceFactor(node);

    return (
      <>
        {/* Draw the current node */}
        <animated.circle
          cx={x}
          cy={y}
          r={20}
          fill={balanceFactor < -1 || balanceFactor > 1 ? 'red' : 'steelblue'}
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

        {/* Draw left child and connecting line */}
        {node.left && (
          <>
            <line x1={x} y1={y} x2={leftX} y2={childY} stroke="gray" />
            {renderTree(node.left, leftX, childY, level + 1)}
          </>
        )}

        {/* Draw right child and connecting line */}
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
    <svg ref={svgRef} width={800} height={600} style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
      {renderTree(data, 400, 50, 1)}
    </svg>
  );
};

export default TreeVisualizer;
