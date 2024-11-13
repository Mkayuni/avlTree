import React, { useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const DiagramBox = styled(Box)(({ theme }) => ({
  width: '850px',
  height: '650px',
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  margin: 'auto',
  border: '1px solid #ccc'
}));

// Define dynamic styles for the animation
const getStyles = (speed) => `
  @keyframes fadeIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }

  .node rect {
    transition: fill ${speed}s, stroke ${speed}s;
  }

  .highlighted rect {
    animation: fadeIn ${speed}s ease-out;
    fill: yellow !important;
    stroke: red !important;
  }
`;

const MermaidDiagram = ({ chart, animationSpeed = 1 }) => {
  const diagramRef = useRef(null);

  const renderDiagram = useCallback(() => {
    if (!chart) return;

    mermaid.mermaidAPI.initialize({ startOnLoad: false });
    mermaid.mermaidAPI.render('avlDiagram', chart, (svgGraph) => {
      const diagramElement = diagramRef.current;
      if (diagramElement) {
        diagramElement.innerHTML = svgGraph;

        const styles = getStyles(animationSpeed);

        const svg = diagramElement.querySelector('svg');
        if (svg) {
          const styleElement = document.createElement('style');
          styleElement.textContent = styles;
          svg.prepend(styleElement);

          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        }

        // Optionally remove the highlighted class after the animation
        setTimeout(() => {
          const highlightedNode = svg.querySelector('.highlighted rect');
          if (highlightedNode) {
            highlightedNode.classList.remove('highlighted');
          }
        }, animationSpeed * 1000);
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