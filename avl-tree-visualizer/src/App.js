import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, TextField, Button, Slider } from '@mui/material';
import AVLTree from './avlTree';
import { useSprings, animated } from 'react-spring';
import './App.css';

const App = () => {
  const [avlTree] = useState(new AVLTree());
  const [number, setNumber] = useState('');
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [lines, setLines] = useState([]);
  const [rotationInfo, setRotationInfo] = useState({ type: '', x: 0, y: 0 });
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [svgWidth, setSvgWidth] = useState(window.innerWidth); // Responsive SVG width

  // Update tree structure and lines when window resizes
  useEffect(() => {
    const handleResize = () => {
      setSvgWidth(window.innerWidth);
      updateTree(); // Recalculate tree structure and lines
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Insert
  const handleInsert = () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    const rotation = avlTree.insert(parseInt(number)) || { type: '', x: 0, y: 0 };
    updateTree();
    setRotationInfo(rotation);
    setTimeout(() => setRotationInfo({ type: '', x: 0, y: 0 }), animationSpeed);
    setNumber('');
    setError(null);
  };

  // Handle Delete
  const handleDelete = () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    const rotation = avlTree.delete(parseInt(number)) || { type: '', x: 0, y: 0 };
    updateTree();
    setRotationInfo(rotation);
    setTimeout(() => setRotationInfo({ type: '', x: 0, y: 0 }), animationSpeed);
    setNumber('');
    setError(null);
  };

  // Update tree structure and lines
  const updateTree = () => {
    const newNodes = getTreeNodes(avlTree.root);
    const newLines = getTreeLines(avlTree.root);
    setNodes(newNodes);
    setLines(newLines);
  };

  // Helper to get node positions
  const getTreeNodes = (node, x = svgWidth / 2, y = 50, level = 1, nodes = []) => {
    if (!node) return nodes;
    nodes.push({ value: node.value, x, y });
    const offsetX = svgWidth / (4 * level);
    getTreeNodes(node.left, x - offsetX, y + 50, level + 1, nodes);
    getTreeNodes(node.right, x + offsetX, y + 50, level + 1, nodes);
    return nodes;
  };

  // Helper to create lines connecting nodes
  const getTreeLines = (node, x = svgWidth / 2, y = 50, level = 1, lines = []) => {
    if (!node) return lines;
    const offsetX = svgWidth / (4 * level);
    if (node.left) {
      lines.push({ x1: x, y1: y, x2: x - offsetX, y2: y + 50 });
      getTreeLines(node.left, x - offsetX, y + 50, level + 1, lines);
    }
    if (node.right) {
      lines.push({ x1: x, y1: y, x2: x + offsetX, y2: y + 50 });
      getTreeLines(node.right, x + offsetX, y + 50, level + 1, lines);
    }
    return lines;
  };

  // Create animations for nodes using useSprings with adjustable speed
  const springs = useSprings(
    nodes.length,
    nodes.map((node) => ({
      to: { transform: `translate(${node.x}px, ${node.y}px)` },
      config: { duration: animationSpeed },
    }))
  );

  return (
    <Container maxWidth={false} className="app-container">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">AVL Tree Visualizer</Typography>
        </Toolbar>
      </AppBar>

      <div className="controls">
        <TextField
          label="Enter a number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          type="number"
          margin="normal"
          error={!!error}
          helperText={error || ''}
        />
        <Button variant="contained" color="primary" onClick={handleInsert} style={{ marginLeft: '10px' }}>Insert</Button>
        <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginLeft: '10px' }}>Delete</Button>
        <Typography variant="body1" style={{ marginTop: '10px' }}>
          Animation Speed:
        </Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          aria-labelledby="animation-speed-slider"
          min={200}
          max={2000}
          step={100}
        />
      </div>

      <div style={{ border: '2px solid black', borderRadius: '8px', padding: '10px', marginTop: '20px' }}>
        <svg width={svgWidth} height="500">
          {/* Render lines */}
          {lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="black"
              strokeWidth="2"
            />
          ))}
          
          {/* Render nodes with animation */}
          {springs.map((style, index) => (
            <animated.g key={nodes[index].value} style={style}>
              <circle cx={0} cy={0} r="15" fill="lightblue" />
              <text x={0} y={5} textAnchor="middle" alignmentBaseline="middle">
                {nodes[index].value}
              </text>
            </animated.g>
          ))}

          {/* Display rotation type in the SVG area */}
          {rotationInfo.type && (
            <text x={rotationInfo.x} y={rotationInfo.y - 20} fill="red" fontSize="16" textAnchor="middle">
              {rotationInfo.type}
            </text>
          )}
        </svg>
      </div>

      {error && <Typography color="error" className="error-message">{error}</Typography>}
    </Container>
  );
};

export default App;