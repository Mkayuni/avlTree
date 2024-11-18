import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, TextField, Button, Grid, Slider } from '@mui/material';
import MermaidDiagram from './MermaidDiagram';
import TreeVisualizer from './TreeVisualizer';
import './App.css';
import { TreeNode, insertWithoutBalancing, balanceTree, deleteNode, addBalanceFactorToNode } from './avlTree';

const App = () => {
  const [chart, setChart] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // Speed in milliseconds
  const [delayBeforeBalance, setDelayBeforeBalance] = useState(2000); // Delay in milliseconds
  const [treeData, setTreeData] = useState(null);
  const [root, setRoot] = useState(null);
  const [balancedNode, setBalancedNode] = useState(null);
  const [childNodes, setChildNodes] = useState([]);
  



  // Reset the AVL tree
  const resetTree = () => {
    setRoot(null);
    setTreeData(null);
    setChart('');
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateMermaidSource = (node, highlightNodes = []) => {
    if (!node) return '';
    let source = `graph TD;\n`;

    const traverse = (n) => {
      if (!n) return;
      let nodeClass = highlightNodes.includes(n.data) ? 'highlighted' : 'node';
      source += `${n.data}[${n.data} \\n height: ${n.height}]:::${nodeClass};\n`;

      if (n.left) {
        source += `${n.data} --> ${n.left.data};\n`;
        traverse(n.left);
      }
      if (n.right) {
        source += `${n.data} --> ${n.right.data};\n`;
        traverse(n.right);
      }
    };

    traverse(node);
    return source;
  };

  const updateTree = (newRoot, highlightNodes = []) => {
    const avlTree = addBalanceFactorToNode(newRoot);
    setTreeData(avlTree);
    setChart(generateMermaidSource(avlTree, highlightNodes));
  };

  // Function to insert with delay
    const handleInsertWithDelay = async (data) => {
      if (!treeData) {
        const newTree = new TreeNode(data);
        setTreeData(newTree);
        setRoot(newTree);
        return;
      }
    
      let traversedNodes = [];
      let steps = [];
      let rotationInfo = { balancedNode: null, childNodes: [] };
    
      // Step 1: Insert the node without balancing
      const newRoot = insertWithoutBalancing(root, parseInt(data), traversedNodes);
      setRoot(newRoot);
      setTreeData(addBalanceFactorToNode(newRoot));
    
      // Force a re-render to show the unbalanced state
      await delay(500); // Short delay to render the unbalanced tree
    
      // Step 2: Add extra delay for small trees to avoid flicker
      const extraDelay = treeSize(newRoot) < 4 ? 1500 : 500;
      await delay(extraDelay);
    
      // Step 3: Balance the tree and update the rotation info
      const balancedRoot = balanceTree(newRoot, steps, rotationInfo);
    
      // Highlight the problematic node and its immediate children
      setBalancedNode(rotationInfo.balancedNode);
      setChildNodes(rotationInfo.childNodes);
      setTreeData(addBalanceFactorToNode(newRoot));
    
      await delay(1000);
    
      // Step 4: Update the tree after balancing
      setRoot(balancedRoot);
      setTreeData(addBalanceFactorToNode(balancedRoot));
      setBalancedNode(null);
      setChildNodes([]);
  };
  
  // Helper function to get the size of the tree
  const treeSize = (node) => {
    if (!node) return 0;
    return 1 + treeSize(node.left) + treeSize(node.right);
  };
  
  
  // Insert a number with a delay
  const handleInsert = async () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    setError(null);
    await handleInsertWithDelay(parseInt(number));
    setNumber('');
  };

  const handleDelete = async () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    setError(null);

    let traversedNodes = [];
    const newRoot = deleteNode(root, parseInt(number), traversedNodes);
    setRoot(newRoot);
    updateTree(newRoot, traversedNodes);
    setNumber('');
  };

  useEffect(() => {
    resetTree();
  }, []);

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
        <Button variant="contained" color="primary" onClick={handleInsert} style={{ marginLeft: '10px' }}>
          Insert
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginLeft: '10px' }}>
          Delete
        </Button>
        <Button variant="contained" onClick={resetTree} style={{ marginLeft: '10px' }}>
          Reset Tree
        </Button>
      </div>

      <div className="animation-speed-control">
        <Typography gutterBottom>Animation Speed (ms)</Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          min={100}
          max={3000}
          step={100}
          valueLabelDisplay="auto"
        />
      </div>

      <div className="delay-control">
        <Typography gutterBottom>Delay Before Balancing (ms)</Typography>
        <Slider
          value={delayBeforeBalance}
          onChange={(e, value) => setDelayBeforeBalance(value)}
          min={500}
          max={5000}
          step={500}
          valueLabelDisplay="auto"
        />
      </div>

      <Grid container spacing={2} className="charts-container" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <MermaidDiagram chart={chart} animationSpeed={animationSpeed} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TreeVisualizer 
          data={treeData} 
          balancedNode={balancedNode} 
          childNodes={childNodes} 
          animationSpeed={animationSpeed} 
        />
      </Grid>
    </Grid>

      {error && <Typography color="error" className="error-message">{error}</Typography>}
    </Container>
  );
};

export default App;
