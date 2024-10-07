import React, { useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const DiagramBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  flex: 3,
  overflow: 'hidden',
  width: '100%',
  height: '100%',
}));

// Function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Function to render styles for the Mermaid diagram with animation speed
const getStyles = (speed) => `
  .node rect {
    transition: fill ${speed}s, stroke ${speed}s;
  }
  .highlighted rect {
    fill: yellow !important;
    stroke: red !important;
  }
`;

// MermaidDiagram component
const MermaidDiagram = ({ chart, animationSpeed = 1 }) => {
  const diagramRef = useRef(null);

  // Function to render the diagram using Mermaid
  const renderDiagram = useCallback(() => {
    if (!chart) return;

    console.log('Mermaid source:', chart); // Debug log to check the generated Mermaid code

    // Initialize Mermaid and render the chart
    mermaid.mermaidAPI.initialize({ startOnLoad: false });
    mermaid.mermaidAPI.render('avlDiagram', chart, (svgGraph) => {
      const diagramElement = diagramRef.current;
      if (diagramElement) {
        diagramElement.innerHTML = svgGraph;

        // Generate and inject styles based on animation speed
        const styles = getStyles(animationSpeed);

        const svg = diagramElement.querySelector('svg');
        if (svg) {
          const styleElement = document.createElement('style');
          styleElement.textContent = styles;
          svg.prepend(styleElement);
        }
      }
    });
  }, [chart, animationSpeed]);

  useEffect(() => {
    if (chart) {
      renderDiagram();
    } else {
      const diagramElement = diagramRef.current;
      if (diagramElement) {
        diagramElement.innerHTML = null;
      }
    }
  }, [chart, renderDiagram]);

  return <DiagramBox ref={diagramRef} id="diagram"></DiagramBox>;
};

export default MermaidDiagram;
