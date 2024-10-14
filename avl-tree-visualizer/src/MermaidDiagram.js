// MermaidDiagram.js
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

const getStyles = (speed) => `
  .node rect {
    transition: fill ${speed}s, stroke ${speed}s;
  }
  .highlighted rect {
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
