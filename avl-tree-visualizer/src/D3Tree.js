// D3Tree.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const D3Tree = ({ data, animationSpeed }) => {
  const svgRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [treeData, setTreeData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Playback speed factor
  const playTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear tree data and reset current step
    if (!data) {
      setTreeData(null);
      setCurrentStep(0);
      setIsPlaying(false);
      d3.select(svgRef.current).selectAll('*').remove(); // Clear the SVG content
      return;
    }
    // Set new tree data
    setTreeData(data);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [data]);

  const calculateBalanceFactor = (node) => {
    const leftHeight = node.left ? node.left.height : 0;
    const rightHeight = node.right ? node.right.height : 0;
    return leftHeight - rightHeight;
  };

  const drawTree = (treeData) => {
    const width = 800;
    const height = 600;
    const padding = 50;

    const svgElement = svgRef.current;
    d3.select(svgElement).selectAll('*').remove(); // Clear existing tree

    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#f0f0f0')
      .style('border', '1px solid #ccc');

    const g = svg.append('g')
      .attr('transform', `translate(${padding},${padding})`);

    const treeLayout = d3.tree().size([width - 2 * padding, height - 2 * padding]);

    const root = d3.hierarchy(treeData, d => [d.left, d.right].filter(Boolean));
    treeLayout(root);

    const link = g.selectAll('.link')
      .data(root.links(), d => d.target.data.data)
      .join('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-width', 2)
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      )
      .style('opacity', 0); // Start invisible

    const node = g.selectAll('.node')
      .data(root.descendants(), d => d.data.data)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('opacity', 0); // Start invisible

    node.append('circle')
      .attr('r', 15)
      .attr('fill', d => d.data.highlighted ? 'yellow' : '#fff')
      .attr('stroke', '#000');

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .text(d => d.data.data);

    // Add balance factor (bf) text next to each link
    g.selectAll('.bf-text')
      .data(root.links())
      .join('text')
      .attr('class', 'bf-text')
      .attr('x', d => (d.source.x + d.target.x) / 2 + 20) // Positioning to the right of the link's center
      .attr('y', d => (d.source.y + d.target.y) / 2)
      .attr('text-anchor', 'start')
      .attr('dy', '0.35em')
      .text(d => calculateBalanceFactor(d.target.data))
      .style('opacity', 0); // Start invisible

    return { link, node };
  };

  const showCurrentStep = () => {
    if (!treeData) return;
    const { link, node } = drawTree(treeData);

    const root = d3.hierarchy(treeData, d => [d.left, d.right].filter(Boolean));
    const allNodes = root.descendants();

    node.filter((d, i) => i <= currentStep)
      .transition()
      .duration(1000 / animationSpeed)
      .style('opacity', 1);

    link.filter((d, i) => i <= currentStep - 1)
      .transition()
      .duration(1000 / animationSpeed)
      .style('opacity', 1);

    // Animate bf text visibility based on the current step
    d3.select(svgRef.current).selectAll('.bf-text')
      .filter((d, i) => i <= currentStep - 1)
      .transition()
      .duration(1000 / animationSpeed)
      .style('opacity', 1);
  };

  const stepForward = () => {
    if (!treeData) return;
    const root = d3.hierarchy(treeData, d => [d.left, d.right].filter(Boolean));
    if (currentStep < root.descendants().length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetTree = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    clearTimeout(playTimeoutRef.current);
    d3.select(svgRef.current).selectAll('*').remove(); // Clear the SVG content
    drawTree(treeData);
  };

  const playSteps = () => {
    setIsPlaying(true);
    const play = () => {
      const root = d3.hierarchy(treeData, d => [d.left, d.right].filter(Boolean));
      if (currentStep < root.descendants().length - 1) {
        stepForward();
        playTimeoutRef.current = setTimeout(play, 1000 / (playbackSpeed * animationSpeed));
      } else {
        setIsPlaying(false);
        clearTimeout(playTimeoutRef.current);
      }
    };
    play();
  };

  const stopPlaying = () => {
    setIsPlaying(false);
    clearTimeout(playTimeoutRef.current);
  };

  useEffect(() => {
    if (treeData) {
      showCurrentStep();
    }
  }, [treeData, currentStep, animationSpeed]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={resetTree}>Reset</button>
        <button onClick={stepBackward} disabled={isPlaying}>Skip Back</button>
        <button onClick={stepForward} disabled={isPlaying}>Next Step</button>
        <button onClick={playSteps} disabled={isPlaying}>Play</button>
        <button onClick={stopPlaying} disabled={!isPlaying}>Stop</button>
        <select onChange={(e) => setPlaybackSpeed(Number(e.target.value))} value={playbackSpeed}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

export default D3Tree;
