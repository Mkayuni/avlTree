class AVLNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
      this.height = 1;
    }
  }
  
  class AVLTree {
    constructor() {
      this.root = null;
    }
  
    getHeight(node) {
      return node ? node.height : 0;
    }
  
    updateHeight(node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  
    rotateRight(y, rotationInfo) {
      const x = y.left;
      const T2 = x.right;
      x.right = y;
      y.left = T2;
      this.updateHeight(y);
      this.updateHeight(x);
  
      // Set rotation info for display
      rotationInfo.type = 'Right Rotation';
      rotationInfo.x = x.value * 20; // Replace with actual coordinates
      rotationInfo.y = 100; // Adjust as necessary
      return x;
    }
  
    rotateLeft(x, rotationInfo) {
      const y = x.right;
      const T2 = y.left;
      y.left = x;
      x.right = T2;
      this.updateHeight(x);
      this.updateHeight(y);
  
      // Set rotation info for display
      rotationInfo.type = 'Left Rotation';
      rotationInfo.x = y.value * 20; // Replace with actual coordinates
      rotationInfo.y = 100; // Adjust as necessary
      return y;
    }
  
    insert(value) {
      const rotationInfo = { type: '', x: 0, y: 0 }; // Initialize rotation info
      this.root = this._insertNode(this.root, value, rotationInfo);
      return rotationInfo; // Return rotation info for display
    }
  
    _insertNode(node, value, rotationInfo) {
      if (!node) return new AVLNode(value);
  
      if (value < node.value) node.left = this._insertNode(node.left, value, rotationInfo);
      else if (value > node.value) node.right = this._insertNode(node.right, value, rotationInfo);
      else return node;
  
      this.updateHeight(node);
  
      const balanceFactor = this.getHeight(node.left) - this.getHeight(node.right);
  
      if (balanceFactor > 1 && value < node.left.value) return this.rotateRight(node, rotationInfo);
      if (balanceFactor < -1 && value > node.right.value) return this.rotateLeft(node, rotationInfo);
      if (balanceFactor > 1 && value > node.left.value) {
        node.left = this.rotateLeft(node.left, rotationInfo);
        return this.rotateRight(node, rotationInfo);
      }
      if (balanceFactor < -1 && value < node.right.value) {
        node.right = this.rotateRight(node.right, rotationInfo);
        return this.rotateLeft(node, rotationInfo);
      }
      return node;
    }
  
    // Implement similar logic for delete if needed
  }
  
  export default AVLTree;