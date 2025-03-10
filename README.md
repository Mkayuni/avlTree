# AVL Tree Visualizer

A dynamic, interactive web application for visualizing AVL tree operations and rotations. Perfect for students, teachers, and anyone interested in learning about self-balancing binary search trees.

![AVL Tree Visualizer Demo](./public/demo-screenshot.png)

## 🌟 Features

- **Interactive Tree Operations**: Insert and delete nodes with real-time animations
- **Automatic Balancing**: Visualize AVL tree rotations when they occur
- **Adjustable Animation Speed**: Control the visualization pace
- **Multiple Visualization Methods**: D3.js tree view and Mermaid diagram support
- **Responsive Design**: Works across desktop and tablet devices

## 🔧 Technologies

- React.js
- D3.js for tree rendering
- Mermaid.js for alternative tree diagram visualization
- Material UI for interface components
- React Spring for smooth animations

## 📋 Project Structure

```
avl-tree-visualizer/
├── public/                  # Static files
├── src/                     # Source files
│   ├── App.js               # Main application component
│   ├── App.css              # Main stylesheet
│   ├── D3Tree.js            # D3-based tree visualization component
│   ├── MermaidDiagram.js    # Mermaid-based tree diagram component
│   ├── avlTree.js           # AVL tree implementation
│   ├── index.js             # Application entry point
│   └── ...                  # Other utility files
├── package.json             # Project dependencies
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/avl-tree-visualizer.git
   cd avl-tree-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🧠 How AVL Trees Work

AVL trees are self-balancing binary search trees where the difference between heights of left and right subtrees for any node cannot exceed 1. This balancing is maintained through rotations:

- **Left Rotation**: Applied when the right subtree becomes too heavy
- **Right Rotation**: Applied when the left subtree becomes too heavy
- **Left-Right Rotation**: A combination of left rotation on the left child followed by a right rotation on the node
- **Right-Left Rotation**: A combination of right rotation on the right child followed by a left rotation on the node

The application helps visualize these rotations as they happen during insertions and deletions.

## 🎮 How to Use

1. **Insert a Node**: Enter a numeric value in the input field and click "Insert"
2. **Delete a Node**: Enter an existing value and click "Delete"
3. **Adjust Speed**: Use the slider to control the animation speed
4. **Play Controls**: Use the control buttons to reset, step through, or play the visualization
5. **View Rotations**: When a rotation occurs, the type will be displayed near the affected nodes

## 💻 Implementation Details

### AVL Tree Class

The `AVLTree` class implements:
- Node insertion with automatic balancing
- Balance factor calculation
- Left and right rotations
- Height updates after operations
- Optional node deletion with rebalancing

### Visualization Components

- **D3Tree**: Renders an SVG-based animated tree visualization with step-by-step node addition
- **MermaidDiagram**: Provides an alternative tree representation using Mermaid.js syntax

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

1. **Report bugs**: Open an issue if you find any bugs
2. **Feature suggestions**: Submit an issue with your feature idea
3. **Code contributions**: Fork the repository, make your changes, and submit a pull request

Please adhere to the existing code style and add appropriate tests for new features.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Additional Resources

- [AVL Tree Wikipedia](https://en.wikipedia.org/wiki/AVL_tree)
- [D3.js Documentation](https://d3js.org/)
- [Mermaid.js Documentation](https://mermaid-js.github.io/mermaid/)
- [React Spring Documentation](https://react-spring.dev/)

---

Happy balancing! 🌲
