import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, TextField, Button, Slider } from '@mui/material';
import axiosInstance from './axiosInstance';  // Import the axios instance
import MermaidDiagram from './MermaidDiagram';  // Import your Mermaid diagram component

const App = () => {
  const [chart, setChart] = useState('');  // Mermaid chart state
  const [number, setNumber] = useState('');  // Number input state
  const [error, setError] = useState(null);  // Error handling state
  const [animationSpeed, setAnimationSpeed] = useState(1);  // Control animation speed

  // Function to fetch the AVL tree from the backend and update the Mermaid diagram
  const fetchTree = async (highlightNodes = []) => {
    try {
      const response = await axiosInstance.get('/avl-tree');
      const avlTree = response.data.root;
      if (avlTree) {
        const mermaidSource = generateMermaidSource(avlTree, highlightNodes);
        console.log("Mermaid Diagram to Render:", mermaidSource);  // Debug: log the source being set in the state
        setChart(mermaidSource);
      } else {
        setChart('');  // Clear the chart if the tree is empty
      }
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
    try {
      const response = await axiosInstance.post('/insert', { data: parseFloat(number) });
      const highlightNodes = response.data.traversedNodes || [];  // Nodes traversed during insertion
      fetchTree(highlightNodes);  // Fetch the updated tree and highlight nodes
      setNumber('');  // Clear the input field
    } catch (err) {
      console.error('Error inserting number:', err);
      setError('Failed to insert number');
    }
  };

  // Handle deleting a number from the AVL tree
  const handleDelete = async () => {
    try {
      const response = await axiosInstance.post('/delete', { data: parseFloat(number) });
      const highlightNodes = response.data.traversedNodes || [];  // Nodes traversed during deletion
      fetchTree(highlightNodes);  // Fetch the updated tree and highlight nodes
      setNumber('');  // Clear the input field
    } catch (err) {
      console.error('Error deleting number:', err);
      setError('Failed to delete number');
    }
  };

  // Handle deleting the entire AVL tree
  const handleDeleteTree = async () => {
    try {
      await axiosInstance.post('/delete-tree');  // Call the new backend route to delete the entire tree
      fetchTree();  // Fetch the updated (empty) tree
    } catch (err) {
      console.error('Error deleting the tree:', err);
      setError('Failed to delete the tree');
    }
  };

  // Fetch the AVL tree initially when the component loads
  useEffect(() => {
    fetchTree();
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
        onChange={(e) => setNumber(e.target.value)}
        type="number"
        margin="normal"
      />
      
      {/* Buttons to insert or delete the number */}
      <Button variant="contained" color="primary" onClick={handleInsert}>
        Insert
      </Button>
      <Button variant="contained" color="secondary" onClick={handleDelete} style={{ marginLeft: '10px' }}>
        Delete
      </Button>
      <Button variant="contained" color="error" onClick={handleDeleteTree} style={{ marginLeft: '10px' }}>
        Delete Entire Tree
      </Button>
      
      {/* Error message display */}
      {error && <Typography color="error">{error}</Typography>}
      
      {/* Mermaid diagram for AVL tree visualization */}
      <MermaidDiagram chart={chart} animationSpeed={animationSpeed} />
    </Container>
  );
};

export default App;
