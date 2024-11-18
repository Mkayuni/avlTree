class TreeNode {
  constructor(data) {
      this.data = data;
      this.left = null;
      this.right = null;
      this.height = 1;
      this.balanceFactor = 0;
  }
}

const height = (node) => (node ? node.height : 0);
const max = (a, b) => (a > b ? a : b);

const updateBalanceFactor = (node) => {
  if (node) {
      node.balanceFactor = height(node.left) - height(node.right);
  }
};

const rightRotate = (y, rotationInfo) => {
  let x = y.left;
  let T2 = x.right;
  
  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  y.height = max(height(y.left), height(y.right)) + 1;
  x.height = max(height(x.left), height(x.right)) + 1;

  // Update balance factors
  updateBalanceFactor(x);
  updateBalanceFactor(y);

  // Set rotation info for visualization
  if (rotationInfo) {
      rotationInfo.type = 'Right Rotation';
      rotationInfo.node = y.data;
  }

  return x;
};

const leftRotate = (x, rotationInfo) => {
  let y = x.right;
  let T2 = y.left;
  
  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update heights
  x.height = max(height(x.left), height(x.right)) + 1;
  y.height = max(height(y.left), height(y.right)) + 1;

  // Update balance factors
  updateBalanceFactor(x);
  updateBalanceFactor(y);

  // Set rotation info for visualization
  if (rotationInfo) {
      rotationInfo.type = 'Left Rotation';
      rotationInfo.node = x.data;
  }

  return y;
};


const getBalance = (node) => (node ? height(node.left) - height(node.right) : 0);


// Insert a new node without balancing
const insertWithoutBalancing = (node, data, traversedNodes = []) => {
  if (!node) {
      traversedNodes.push(data);
      return new TreeNode(data);
  }
  traversedNodes.push(node.data);

  if (data < node.data) {
      node.left = insertWithoutBalancing(node.left, data, traversedNodes);
  } else if (data > node.data) {
      node.right = insertWithoutBalancing(node.right, data, traversedNodes);
  } else {
      return node; // Duplicate data not allowed
  }

  // Update height and balance factor without balancing the tree
  node.height = max(height(node.left), height(node.right)) + 1;
  updateBalanceFactor(node);
  return node;
};

  const insertWithDelay = async (root, data, setTreeData, rotationInfo, delay = 1500) => {
      // Step 1: Initialize the variables
      const steps = []; // Initialize steps as an empty array
      const traversedNodes = []; // Array to keep track of traversed nodes during insertion

      // Step 2: Insert the node without balancing and visualize the unbalanced tree
      let unbalancedTree = insertWithoutBalancing(root, data, traversedNodes);
      setTreeData(addBalanceFactorToNode(unbalancedTree)); // Update the visualization with the unbalanced state

      // Step 3: Wait for the specified delay before balancing (e.g., 1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Step 4: Balance the tree using the `balanceTree` function
      const balancedTree = balanceTree(unbalancedTree, steps, rotationInfo);
      setTreeData(addBalanceFactorToNode(balancedTree)); // Update the visualization with the balanced state

      return balancedTree; // Return the balanced tree
  };


// Balance the AVL tree recursively to handle deeper imbalances
const balanceTree = (node, steps = [], rotationInfo = null) => {
  // Ensure steps is always an array
  if (!Array.isArray(steps)) {
      steps = [];
  }

  if (!node) return node;

  // Recursively balance the left and right subtrees first (bottom-up approach)
  node.left = balanceTree(node.left, steps, rotationInfo);
  node.right = balanceTree(node.right, steps, rotationInfo);

  // Update height and balance factor after balancing subtrees
  node.height = max(height(node.left), height(node.right)) + 1;
  updateBalanceFactor(node);

  const balance = getBalance(node);

  // Left-Left (LL) Case
  if (balance > 1 && getBalance(node.left) >= 0) {
      steps.push({ type: 'rightRotate', node: node.data });
      return rightRotate(node, rotationInfo);
  }

  // Left-Right (LR) Case
  if (balance > 1 && getBalance(node.left) < 0) {
      steps.push({ type: 'leftRotate', node: node.left.data });
      node.left = leftRotate(node.left, rotationInfo);
      steps.push({ type: 'rightRotate', node: node.data });
      return rightRotate(node, rotationInfo);
  }

  // Right-Right (RR) Case
  if (balance < -1 && getBalance(node.right) <= 0) {
      steps.push({ type: 'leftRotate', node: node.data });
      return leftRotate(node, rotationInfo);
  }

  // Right-Left (RL) Case
  if (balance < -1 && getBalance(node.right) > 0) {
      steps.push({ type: 'rightRotate', node: node.right.data });
      node.right = rightRotate(node.right, rotationInfo);
      steps.push({ type: 'leftRotate', node: node.data });
      return leftRotate(node, rotationInfo);
  }

  return node;
};


// Delete a node
const deleteNode = (root, data, traversedNodes = [], steps = [], rotationInfo) => {
  if (!root) return root;

  traversedNodes.push(root.data);

  if (data < root.data) {
      root.left = deleteNode(root.left, data, traversedNodes, steps, rotationInfo);
  } else if (data > root.data) {
      root.right = deleteNode(root.right, data, traversedNodes, steps, rotationInfo);
  } else {
      if (!root.left || !root.right) {
          let temp = root.left ? root.left : root.right;
          root = temp;
      } else {
          let temp = minValueNode(root.right);
          root.data = temp.data;
          root.right = deleteNode(root.right, temp.data, traversedNodes, steps, rotationInfo);
      }
  }

  if (!root) return root;

  root.height = max(height(root.left), height(root.right)) + 1;
  updateBalanceFactor(root);

  let balance = getBalance(root);

  if (balance > 1 && getBalance(root.left) >= 0) {
      steps.push({ type: 'rightRotate', node: root.data });
      return rightRotate(root, rotationInfo);
  }
  if (balance > 1 && getBalance(root.left) < 0) {
      root.left = leftRotate(root.left, rotationInfo);
      return rightRotate(root, rotationInfo);
  }
  if (balance < -1 && getBalance(root.right) <= 0) {
      steps.push({ type: 'leftRotate', node: root.data });
      return leftRotate(root, rotationInfo);
  }
  if (balance < -1 && getBalance(root.right) > 0) {
      root.right = rightRotate(root.right, rotationInfo);
      return leftRotate(root, rotationInfo);
  }

  return root;
};


const minValueNode = (node) => {
  while (node.left) node = node.left;
  return node;
};

const addBalanceFactorToNode = (node) => {
  if (!node) return null;
  return {
      data: node.data,
      height: node.height,
      balanceFactor: node.balanceFactor,
      left: addBalanceFactorToNode(node.left),
      right: addBalanceFactorToNode(node.right)
  };
};

export { TreeNode, insertWithoutBalancing, balanceTree, deleteNode, addBalanceFactorToNode };

