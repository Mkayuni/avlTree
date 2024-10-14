// App.js
import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, TextField, Button, Grid } from '@mui/material';
import axiosInstance from './axiosInstance';
import MermaidDiagram from './MermaidDiagram';
import D3Tree from './D3Tree';
import './App.css';

const App = () => {
  const [chart, setChart] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [remainingNodes, setRemainingNodes] = useState([]);
  const [treeData, setTreeData] = useState(null);

  const resetTree = async () => {
    try {
      await axiosInstance.post('/reset-tree');
    } catch (err) {
      console.error('Error resetting the AVL tree:', err);
      setError('Failed to reset AVL tree');
    }
  };

  const fetchTree = async (highlightNodes = []) => {
    try {
      const response = await axiosInstance.get('/avl-tree');
      const avlTree = response.data.root;
      const remainingNodes = response.data.remainingNodes || [];

      if (avlTree) {
        const mermaidSource = generateMermaidSource(avlTree, highlightNodes);
        setChart(mermaidSource);
        setTreeData(avlTree);
      } else {
        setChart('');
        setTreeData(null);
      }

      setRemainingNodes(remainingNodes);
    } catch (err) {
      console.error('Error fetching AVL tree data:', err);
      setError('Failed to fetch AVL tree data');
    }
  };

  const generateMermaidSource = (node, highlightNodes = []) => {
    if (!node) return '';
    let source = `graph TD;\n`;

    const traverse = (n) => {
      if (!n) return;

      let nodeClass = highlightNodes.includes(n.data) ? 'highlighted' : 'node';
      source += `${n.data}[${n.data} \\n height: ${n.height}]:::${nodeClass};\n`;

      if (n.left) {
        source += `${n.data} --> ${n.left.data};\n`;
        traverse(n.left); // Traverse left subtree first
      }
      if (n.right) {
        source += `${n.data} --> ${n.right.data};\n`;
        traverse(n.right); // Then traverse the right subtree
      }
    };

    traverse(node);
    return source;
  };

  const handleInsert = async () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    try {
      const response = await axiosInstance.post('/insert', { data: parseFloat(number) });
      const highlightNodes = response.data.traversedNodes || [];
      fetchTree(highlightNodes);
      setNumber('');
      setError(null);
    } catch (err) {
      console.error('Error inserting number:', err);
      setError('Failed to insert number');
    }
  };

  const handleDelete = async () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    try {
      const response = await axiosInstance.post('/delete', { data: parseFloat(number) });
      const highlightNodes = response.data.traversedNodes || [];
      fetchTree(highlightNodes);
      setNumber('');
      setError(null);
    } catch (err) {
      console.error('Error deleting number:', err);
      setError('Failed to delete number');
    }
  };

  useEffect(() => {
    resetTree();
    fetchTree();
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
        <Button variant="contained" color="primary" onClick={handleInsert} style={{ marginLeft: '10px' }}>Insert</Button>
        <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginLeft: '10px' }}>Delete</Button>
      </div>

      <Grid container spacing={2} className="charts-container" justifyContent="center">
        <Grid item>
          <MermaidDiagram chart={chart} animationSpeed={animationSpeed} />
        </Grid>
        <Grid item>
          <D3Tree data={treeData} animationSpeed={animationSpeed} />
        </Grid>
      </Grid>

      {error && <Typography color="error" className="error-message">{error}</Typography>}
    </Container>
  );
};

export default App;
