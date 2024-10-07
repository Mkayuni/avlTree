const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');  // To handle JSON requests

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());  // Parse incoming JSON requests

// AVL Tree Node structure and helper functions
class TreeNode {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

const height = (node) => {
    if (!node) return 0;
    return node.height;
};

const max = (a, b) => (a > b ? a : b);

const rightRotate = (y) => {
    let x = y.left;
    let T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = max(height(y.left), height(y.right)) + 1;
    x.height = max(height(x.left), height(x.right)) + 1;

    return x;
};

const leftRotate = (x) => {
    let y = x.right;
    let T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = max(height(x.left), height(x.right)) + 1;
    y.height = max(height(y.left), height(y.right)) + 1;

    return y;
};

const getBalance = (node) => {
    if (!node) return 0;
    return height(node.left) - height(node.right);
};

// Insertion function that tracks steps
const insert = (node, data, traversedNodes = [], steps = []) => {
    if (!node) {
        traversedNodes.push(data);  // Track the node being inserted
        return new TreeNode(data);
    }

    traversedNodes.push(node.data);  // Track traversed nodes

    if (data < node.data) {
        node.left = insert(node.left, data, traversedNodes, steps);
    } else if (data > node.data) {
        node.right = insert(node.right, data, traversedNodes, steps);
    } else {
        return node;  // Duplicate data is not allowed
    }

    node.height = max(height(node.left), height(node.right)) + 1;

    let balance = getBalance(node);

    // Left Left Case
    if (balance > 1 && data < node.left.data) {
        steps.push({ type: 'rightRotate', node: node.data });
        return rightRotate(node);
    }
    // Right Right Case
    if (balance < -1 && data > node.right.data) {
        steps.push({ type: 'leftRotate', node: node.data });
        return leftRotate(node);
    }
    // Left Right Case
    if (balance > 1 && data > node.left.data) {
        steps.push({ type: 'leftRotate', node: node.left.data });
        steps.push({ type: 'rightRotate', node: node.data });
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }
    // Right Left Case
    if (balance < -1 && data < node.right.data) {
        steps.push({ type: 'rightRotate', node: node.right.data });
        steps.push({ type: 'leftRotate', node: node.data });
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }

    return node;
};

const deleteNode = (root, data, traversedNodes = [], steps = []) => {
    if (!root) return root;

    traversedNodes.push(root.data);  // Track traversed nodes

    if (data < root.data) {
        root.left = deleteNode(root.left, data, traversedNodes, steps);
    } else if (data > root.data) {
        root.right = deleteNode(root.right, data, traversedNodes, steps);
    } else {
        if (!root.left || !root.right) {
            let temp = root.left ? root.left : root.right;

            if (!temp) {
                temp = root;
                root = null;
            } else {
                root = temp;
            }
        } else {
            let temp = minValueNode(root.right);
            root.data = temp.data;
            root.right = deleteNode(root.right, temp.data, traversedNodes, steps);
        }
    }

    if (!root) return root;

    root.height = max(height(root.left), height(root.right)) + 1;

    let balance = getBalance(root);

    if (balance > 1 && getBalance(root.left) >= 0) {
        steps.push({ type: 'rightRotate', node: root.data });
        return rightRotate(root);
    }
    if (balance > 1 && getBalance(root.left) < 0) {
        steps.push({ type: 'leftRotate', node: root.left.data });
        steps.push({ type: 'rightRotate', node: root.data });
        root.left = leftRotate(root.left);
        return rightRotate(root);
    }
    if (balance < -1 && getBalance(root.right) <= 0) {
        steps.push({ type: 'leftRotate', node: root.data });
        return leftRotate(root);
    }
    if (balance < -1 && getBalance(root.right) > 0) {
        steps.push({ type: 'rightRotate', node: root.right.data });
        steps.push({ type: 'leftRotate', node: root.data });
        root.right = rightRotate(root.right);
        return leftRotate(root);
    }

    return root;
};

const minValueNode = (node) => {
    let current = node;
    while (current.left !== null) current = current.left;
    return current;
};

// Global root node for the AVL tree
let root = null;

// Root route to test server
app.get('/', (req, res) => {
  res.send('AVL Tree Backend');
});

// Insert a number API with traversal tracking and steps for animation
app.post('/insert', (req, res) => {
    const { data } = req.body;
    let traversedNodes = [];
    let steps = [];
    root = insert(root, data, traversedNodes, steps);
    res.json({ success: true, root, traversedNodes, steps });
});

// Delete a number API with traversal tracking
app.post('/delete', (req, res) => {
    const { data } = req.body;
    let traversedNodes = [];
    let steps = [];
    root = deleteNode(root, data, traversedNodes, steps);
    res.json({ success: true, root, traversedNodes, steps });
});

// Delete the entire tree API
app.post('/delete-tree', (req, res) => {
    root = null;  // Reset the root node
    res.json({ success: true, message: 'Tree deleted successfully', root });
});

// Get the current AVL tree as JSON
app.get('/avl-tree', (req, res) => {
    res.json({ root });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
