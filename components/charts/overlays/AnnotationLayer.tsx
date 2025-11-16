'use client';

/**
 * AnnotationLayer Component
 * Renders various types of annotations on charts:
 * - Text annotations at specific coordinates
 * - Reference lines (horizontal/vertical) with labels
 * - Shaded regions for highlighting time periods
 * - Significance markers for statistical findings
 */

import React from 'react';
import type { Annotation, ReferenceLine } from '@/types';
import { useChartThemeOptional } from '@/lib/contexts/ChartThemeContext';

export interface AnnotationLayerProps {
  annotations?: Annotation[];
  referenceLines?: ReferenceLine[];
  xScale: (value: number | string) => number;
  yScale: (value: number | string) => number;
  width: number;
  height: number;
  xDomain?: [number | string, number | string];
  yDomain?: [number, number];
}

/**
 * AnnotationLayer Component
 */
export function AnnotationLayer({
  annotations = [],
  referenceLines = [],
  xScale,
  yScale,
  width,
  height,
  xDomain,
  yDomain,
}: AnnotationLayerProps) {
  const { theme } = useChartThemeOptional();
  
  return (
    <g className="annotation-layer">
      {/* Render reference lines first (behind other elements) */}
      {referenceLines.map((line, index) => (
        <ReferenceLineComponent
          key={`ref-line-${index}`}
          line={line}
          xScale={xScale}
          yScale={yScale}
          width={width}
          height={height}
          theme={theme}
        />
      ))}
      
      {/* Render annotations */}
      {annotations.map((annotation, index) => {
        if (annotation.type === 'text') {
          return (
            <TextAnnotation
              key={`annotation-${index}`}
              annotation={annotation}
              xScale={xScale}
              yScale={yScale}
              theme={theme}
            />
          );
        } else if (annotation.type === 'line') {
          return (
            <LineAnnotation
              key={`annotation-${index}`}
              annotation={annotation}
              xScale={xScale}
              yScale={yScale}
              theme={theme}
            />
          );
        } else if (annotation.type === 'region') {
          return (
            <RegionAnnotation
              key={`annotation-${index}`}
              annotation={annotation}
              xScale={xScale}
              yScale={yScale}
              height={height}
              theme={theme}
            />
          );
        }
        return null;
      })}
    </g>
  );
}

/**
 * ReferenceLineComponent
 * Renders horizontal or vertical reference lines with labels
 */
interface ReferenceLineComponentProps {
  line: ReferenceLine;
  xScale: (value: number | string) => number;
  yScale: (value: number | string) => number;
  width: number;
  height: number;
  theme: any;
}

function ReferenceLineComponent({
  line,
  xScale,
  yScale,
  width,
  height,
  theme,
}: ReferenceLineComponentProps) {
  const color = line.color || theme.tokens.borders.gridLineColor;
  const strokeDasharray = line.strokeDasharray || '5,5';
  
  if (line.axis === 'y') {
    const y = yScale(line.value);
    
    return (
      <g className="reference-line-y">
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={strokeDasharray}
          opacity={0.7}
        />
        {line.label && (
          <g>
            <rect
              x={width - 80}
              y={y - 12}
              width={75}
              height={20}
              fill="white"
              opacity={0.9}
              rx={3}
            />
            <text
              x={width - 75}
              y={y + 3}
              fontSize={theme.typography.dataLabel.fontSize}
              fill={color}
              fontWeight={500}
            >
              {line.label}
            </text>
          </g>
        )}
      </g>
    );
  } else {
    const x = xScale(line.value);
    
    return (
      <g className="reference-line-x">
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={strokeDasharray}
          opacity={0.7}
        />
        {line.label && (
          <g>
            <rect
              x={x - 35}
              y={5}
              width={70}
              height={20}
              fill="white"
              opacity={0.9}
              rx={3}
            />
            <text
              x={x}
              y={20}
              fontSize={theme.typography.dataLabel.fontSize}
              fill={color}
              fontWeight={500}
              textAnchor="middle"
            >
              {line.label}
            </text>
          </g>
        )}
      </g>
    );
  }
}

/**
 * TextAnnotation
 * Renders text at specific coordinates
 */
interface TextAnnotationProps {
  annotation: Annotation;
  xScale: (value: number | string) => number;
  yScale: (value: number | string) => number;
  theme: any;
}

function TextAnnotation({ annotation, xScale, yScale, theme }: TextAnnotationProps) {
  const x = xScale(annotation.position.x);
  const y = yScale(annotation.position.y);
  
  const style = annotation.style || {};
  const color = style.color || theme.typography.dataLabel.color;
  const fontSize = style.fontSize || theme.typography.dataLabel.fontSize;
  const fontWeight = style.fontWeight || theme.typography.dataLabel.fontWeight;
  const backgroundColor = style.backgroundColor || 'white';
  const opacity = style.opacity || 0.9;
  
  // Measure text to create background
  const textLength = annotation.content.length * (fontSize * 0.6);
  const padding = 8;
  
  return (
    <g className="text-annotation">
      {/* Background */}
      <rect
        x={x - padding}
        y={y - fontSize - padding / 2}
        width={textLength + padding * 2}
        height={fontSize + padding}
        fill={backgroundColor}
        opacity={opacity}
        rx={4}
        stroke={style.borderColor || theme.tokens.borders.gridLineColor}
        strokeWidth={style.borderWidth || 1}
      />
      
      {/* Text */}
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={color}
      >
        {annotation.content}
      </text>
    </g>
  );
}

/**
 * LineAnnotation
 * Renders a line annotation (arrow or connector)
 */
interface LineAnnotationProps {
  annotation: Annotation;
  xScale: (value: number | string) => number;
  yScale: (value: number | string) => number;
  theme: any;
}

function LineAnnotation({ annotation, xScale, yScale, theme }: LineAnnotationProps) {
  // For line annotations, position.x and position.y represent start point
  // content should contain end point as "x2,y2"
  const [x2Str, y2Str] = annotation.content.split(',');
  
  const x1 = xScale(annotation.position.x);
  const y1 = yScale(annotation.position.y);
  const x2 = xScale(parseFloat(x2Str));
  const y2 = yScale(parseFloat(y2Str));
  
  const style = annotation.style || {};
  const color = style.color || theme.typography.dataLabel.color;
  
  return (
    <g className="line-annotation">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={style.borderWidth || 2}
        opacity={style.opacity || 0.8}
        markerEnd="url(#arrow)"
      />
      
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>
    </g>
  );
}

/**
 * RegionAnnotation
 * Renders a shaded region to highlight time periods or value ranges
 */
interface RegionAnnotationProps {
  annotation: Annotation;
  xScale: (value: number | string) => number;
  yScale: (value: number | string) => number;
  height: number;
  theme: any;
}

function RegionAnnotation({ annotation, xScale, yScale, height, theme }: RegionAnnotationProps) {
  // For region annotations, position represents start, content represents end
  // Format: "x2,y2" or just "x2" for vertical regions
  const parts = annotation.content.split(',');
  
  const x1 = xScale(annotation.position.x);
  const x2 = xScale(parts[0]);
  
  const style = annotation.style || {};
  const color = style.backgroundColor || theme.colors.categorical[0];
  const opacity = style.opacity || 0.1;
  
  // If y coordinates provided, use them; otherwise use full height
  let y1 = 0;
  let y2 = height;
  
  if (parts.length > 1) {
    y1 = yScale(annotation.position.y);
    y2 = yScale(parseFloat(parts[1]));
  }
  
  const rectWidth = Math.abs(x2 - x1);
  const rectHeight = Math.abs(y2 - y1);
  const rectX = Math.min(x1, x2);
  const rectY = Math.min(y1, y2);
  
  return (
    <g className="region-annotation">
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        fill={color}
        opacity={opacity}
        stroke={style.borderColor}
        strokeWidth={style.borderWidth || 0}
      />
    </g>
  );
}

/**
 * SignificanceMarker Component
 * Renders markers for statistically significant findings
 */
export interface SignificanceMarkerProps {
  x: number | string;
  y: number | string;
  significance: number; // 0-1 scale
  label?: string;
  xScale: (value: number | string) => number;
  yScale: (value: number | string) => number;
}

export function SignificanceMarker({
  x,
  y,
  significance,
  label,
  xScale,
  yScale,
}: SignificanceMarkerProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  
  const xPos = xScale(x);
  const yPos = yScale(y);
  
  // Color based on significance level
  let color = theme.tokens.borders.gridLineColor;
  if (significance >= 0.95) {
    color = getSemanticColor('positive');
  } else if (significance >= 0.90) {
    color = getSemanticColor('warning');
  }
  
  // Number of stars based on significance
  let stars = '';
  if (significance >= 0.99) stars = '***';
  else if (significance >= 0.95) stars = '**';
  else if (significance >= 0.90) stars = '*';
  
  return (
    <g className="significance-marker">
      {/* Marker circle */}
      <circle
        cx={xPos}
        cy={yPos}
        r={6}
        fill={color}
        opacity={0.3}
      />
      <circle
        cx={xPos}
        cy={yPos}
        r={3}
        fill={color}
      />
      
      {/* Stars or label */}
      {(stars || label) && (
        <text
          x={xPos}
          y={yPos - 12}
          fontSize={theme.typography.dataLabel.fontSize}
          fontWeight={600}
          fill={color}
          textAnchor="middle"
        >
          {label || stars}
        </text>
      )}
    </g>
  );
}

export default AnnotationLayer;
