import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, TextField, Button, IconButton, Slider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';  // Import the back arrow icon from Material UI
import axiosInstance from './axiosInstance';  // Import the axios instance
import MermaidDiagram from './MermaidDiagram';  // Import your Mermaid diagram component

const App = () => {
  const [chart, setChart] = useState('');  // Mermaid chart state
  const [number, setNumber] = useState('');  // Number input state
  const [error, setError] = useState(null);  // Error handling state
  const [animationSpeed, setAnimationSpeed] = useState(1);  // Control animation speed
  const [skipbackInProgress, setSkipbackInProgress] = useState(false);  // To track skipback process
  const [remainingNodes, setRemainingNodes] = useState([]);  // Track remaining nodes for skipback

  // Function to reset the AVL tree on page load
  const resetTree = async () => {
    try {
      await axiosInstance.post('/reset-tree');  // Call the reset-tree API to clear the tree
    } catch (err) {
      console.error('Error resetting the AVL tree:', err);
      setError('Failed to reset AVL tree');
    }
  };

  // Function to fetch the AVL tree from the backend and update the Mermaid diagram
  const fetchTree = async (highlightNodes = []) => {
    try {
      const response = await axiosInstance.get('/avl-tree');
      const avlTree = response.data.root;
      const remainingNodes = response.data.remainingNodes || [];

      if (avlTree) {
        const mermaidSource = generateMermaidSource(avlTree, highlightNodes);
        setChart(mermaidSource);
      } else {
        setChart('');  // Clear the chart if the tree is empty
      }

      setRemainingNodes(remainingNodes);  // Update remaining nodes in the state
    } catch (err) {
      console.error('Error fetching AVL tree data:', err);
      setError('Failed to fetch AVL tree data');
    }
  };

  // Function to generate Mermaid source string from the AVL tree structure
  const generateMermaidSource = (node, highlightNodes = []) => {
    if (!node) return '';  // If the node is empty, return an empty string

    let source = `graph TD;\n`;

    // If there's no left or right child, just display the root node
    if (!node.left && !node.right) {
      source += `${node.data}[${node.data} \\n height: ${node.height}]:::node;\n`;
      return source;
    }

    const traverse = (n) => {
      let nodeClass = highlightNodes.includes(n.data) ? 'highlighted' : 'node';
      source += `${n.data}[${n.data} \\n height: ${n.height}]:::${nodeClass};\n`;  // Include node height in the label

      if (n.left) {
        source += `${n.data} --> ${n.left.data};\n`;  // Add left edge
        traverse(n.left);  // Traverse left subtree
      }
      if (n.right) {
        source += `${n.data} --> ${n.right.data};\n`;  // Add right edge
        traverse(n.right);  // Traverse right subtree
      }
    };

    traverse(node);  // Start the traversal from the root node
    return source;
  };

  // Handle inserting a number into the AVL tree
  const handleInsert = async () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    try {
      const response = await axiosInstance.post('/insert', { data: parseFloat(number) });
      const highlightNodes = response.data.traversedNodes || [];
      const updatedRemainingNodes = response.data.remainingNodes || [];

      fetchTree(highlightNodes);  // Fetch the updated tree and highlight nodes
      setNumber('');  // Clear the input field
      setRemainingNodes(updatedRemainingNodes);  // Update the remaining nodes
      setError(null);  // Clear any previous error
    } catch (err) {
      console.error('Error inserting number:', err);
      setError('Failed to insert number');
    }
  };

  // Handle deleting a number from the AVL tree
  const handleDelete = async () => {
    if (!number || isNaN(number)) {
      setError('Please enter a valid number');
      return;
    }
    try {
      const response = await axiosInstance.post('/delete', { data: parseFloat(number) });
      const highlightNodes = response.data.traversedNodes || [];
      const updatedRemainingNodes = response.data.remainingNodes || [];

      fetchTree(highlightNodes);  // Fetch the updated tree and highlight nodes
      setNumber('');  // Clear the input field
      setRemainingNodes(updatedRemainingNodes);  // Update remaining nodes
      setError(null);  // Clear any previous error
    } catch (err) {
      console.error('Error deleting number:', err);
      setError('Failed to delete number');
    }
  };

  // Handle skipback to delete the last inserted node
  const handleSkipback = async () => {
    try {
      setSkipbackInProgress(true);  // Set skipback in progress flag

      // Make the API call to delete the last inserted node (LIFO)
      const response = await axiosInstance.post('/delete-last');
      const updatedRemainingNodes = response.data.remainingNodes || [];

      fetchTree();  // Fetch the updated tree after deletion

      // Update remaining nodes in the state
      setRemainingNodes(updatedRemainingNodes);

      // Reset the skipback process flag after the operation completes
      setSkipbackInProgress(false);
    } catch (err) {
      console.error('Error during skipback:', err);
      setError('Failed to perform skipback');
      setSkipbackInProgress(false);  // Reset flag on error
    }
  };

  // Clear the error if the user enters a valid number
  const handleNumberChange = (e) => {
    const input = e.target.value;
    setNumber(input);

    // Clear error if a valid number is entered
    if (!isNaN(input) && input.trim() !== '') {
      setError(null);
    }
  };

  // Fetch the AVL tree initially when the component loads and reset the tree
  useEffect(() => {
    resetTree();  // Reset the tree on page load
    fetchTree();  // Fetch the (now empty) tree
  }, []);

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">AVL Tree Visualizer</Typography>
        </Toolbar>
      </AppBar>

      {/* Slider to control animation speed */}
      <Slider
        value={animationSpeed}
        onChange={(e, newValue) => setAnimationSpeed(newValue)}
        min={0.5}
        max={3}
        step={0.1}
        valueLabelDisplay="auto"
        label="Animation Speed"
      />

      {/* Input field for entering numbers */}
      <TextField
        label="Enter a number"
        value={number}
        onChange={handleNumberChange}
        type="number"
        margin="normal"
        error={!!error}  // Show error state if there's an error
        helperText={error || ''}
      />
      
      {/* Buttons to insert or delete the number */}
      <Button variant="contained" color="primary" onClick={handleInsert}>
        Insert
      </Button>
      <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginLeft: '10px' }}>
        Delete
      </Button>

      {/* Skipback Button with Back Arrow */}
      <IconButton 
        color="error" 
        onClick={handleSkipback} 
        disabled={skipbackInProgress || remainingNodes.length === 0}  // Only disable when no nodes left or skipback is ongoing
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Error message display */}
      {error && <Typography color="error">{error}</Typography>}
      
      {/* Mermaid diagram for AVL tree visualization */}
      <MermaidDiagram chart={chart} animationSpeed={animationSpeed} />
    </Container>
  );
};

export default App;
