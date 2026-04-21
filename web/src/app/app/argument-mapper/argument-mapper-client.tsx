"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Network,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
  Zap,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer2,
  Move
} from "lucide-react";
import { api, ArgumentVisualization, ArgumentNode, ArgumentEdge } from "@/lib/api-app";

export default function ArgumentMapperClient() {
  const [text, setText] = React.useState("");
  const [visualization, setVisualization] = React.useState<ArgumentVisualization | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = React.useState<ArgumentNode | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const handleVisualize = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSelectedNode(null);
    
    try {
      const result = await api.visualizeArgument(text);
      setVisualization(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to visualize argument");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setText("");
    setVisualization(null);
    setError(null);
    setSelectedNode(null);
    setZoom(1);
  };

  const getNodeColor = (node: ArgumentNode) => {
    if (node.issues.length > 0) return { bg: "bg-red-500", border: "border-red-500", text: "text-red-500" };
    if (node.strength < 0.7) return { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-500" };
    return { bg: "bg-green-500", border: "border-green-500", text: "text-green-500" };
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "conclusion": return Target;
      case "premise": return Lightbulb;
      case "evidence": return Zap;
      default: return Network;
    }
  };

  const getNodePosition = (index: number, total: number, level: number) => {
    const canvasWidth = 800;
    const verticalSpacing = 160;
    const startY = 100;
    const nodeRadius = 45;
    
    if (level === 0) {
      return { x: canvasWidth / 2, y: startY };
    }
    
    const availableWidth = canvasWidth - 120;
    const spacing = availableWidth / Math.max(total, 1);
    return {
      x: 60 + spacing * index + nodeRadius,
      y: startY + verticalSpacing * level
    };
  };

  const getNodePositionsMap = () => {
    if (!visualization) return {};
    
    const conclusionNodes = visualization.nodes.filter(n => n.type === "conclusion");
    const premiseNodes = visualization.nodes.filter(n => n.type === "premise");
    const evidenceNodes = visualization.nodes.filter(n => n.type === "evidence");
    
    const positions: Record<string, { x: number; y: number }> = {};
    
    conclusionNodes.forEach((node, idx) => {
      positions[node.id] = getNodePosition(idx, conclusionNodes.length, 0);
    });
    premiseNodes.forEach((node, idx) => {
      positions[node.id] = getNodePosition(idx, premiseNodes.length, 1);
    });
    evidenceNodes.forEach((node, idx) => {
      positions[node.id] = getNodePosition(idx, evidenceNodes.length, 2);
    });
    
    return positions;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleFitToView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.1, 2));
    } else {
      setZoom(prev => Math.max(prev - 0.1, 0.4));
    }
  };

  const renderCanvas = () => {
    if (!visualization || visualization.nodes.length === 0) return null;

    const conclusionNodes = visualization.nodes.filter(n => n.type === "conclusion");
    const premiseNodes = visualization.nodes.filter(n => n.type === "premise");
    const evidenceNodes = visualization.nodes.filter(n => n.type === "evidence");

    const allNodes = [...conclusionNodes, ...premiseNodes, ...evidenceNodes];
    const nodePositions = getNodePositionsMap();

    return (
      <svg 
        className="w-full h-full"
        viewBox="0 0 800 500"
        style={{ 
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, 
          transformOrigin: 'center',
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
          <marker
            id="arrowhead-dashed"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="nodeGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        const nodePositions = getNodePositionsMap();

        {visualization.edges.map((edge, idx) => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          if (!sourcePos || !targetPos) return null;

          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const nodeRadius = 45;
          
          const adjustedSource = {
            x: sourcePos.x + (dx / length) * nodeRadius,
            y: sourcePos.y + (dy / length) * nodeRadius
          };
          const adjustedTarget = {
            x: targetPos.x - (dx / length) * (nodeRadius + 8),
            y: targetPos.y - (dy / length) * (nodeRadius + 8)
          };

          return (
            <g key={idx}>
              <line
                x1={adjustedSource.x}
                y1={adjustedSource.y}
                x2={adjustedTarget.x}
                y2={adjustedTarget.y}
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd={edge.label === "also supports" ? "url(#arrowhead-dashed)" : "url(#arrowhead)"}
                strokeDasharray={edge.label === "also supports" ? "5,5" : "0"}
              />
              {edge.label !== "supports" && (
                <g>
                  <rect 
                    x={(sourcePos.x + targetPos.x) / 2 - 25} 
                    y={(sourcePos.y + targetPos.y) / 2 - 8} 
                    width="50" 
                    height="16" 
                    rx="4"
                    fill="background"
                  />
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 + 4}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {allNodes.map((node, idx) => {
          const colors = getNodeColor(node);
          const Icon = getNodeIcon(node.type);
          const pos = nodePositions[node.id];
          const isSelected = selectedNode?.id === node.id;

          return (
            <g 
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{ cursor: 'pointer' }}
            >
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="45"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                fill="url(#nodeGradient)"
                stroke={isSelected ? "#3b82f6" : colors.border.replace('border-', '')}
                strokeWidth={isSelected ? 3 : 2}
                filter={isSelected ? "url(#glow)" : "url(#shadow)"}
                className="dark:fill-slate-800"
              />
              <foreignObject x={pos.x - 18} y={pos.y - 18} width="36" height="36">
                <div className={`flex items-center justify-center w-full h-full rounded-full bg-background/80 ${colors.bg}/10`}>
                  <Icon size={22} className={colors.text} />
                </div>
              </foreignObject>
              <text
                x={pos.x}
                y={pos.y + 60}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="currentColor"
                className="text-foreground dark:text-slate-200"
              >
                {node.text.length > 20 ? node.text.substring(0, 20) + "..." : node.text}
              </text>
              <text
                x={pos.x}
                y={pos.y + 75}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                className="capitalize dark:text-slate-400"
              >
                {node.type}
              </text>
              <foreignObject x={(pos?.x || 0) - 14} y={(pos?.y || 0) - 58} width="28" height="18">
                <div className={`flex items-center justify-center w-full h-full ${colors.bg} rounded-full shadow-md`}>
                  <span className="text-[10px] font-bold text-white">
                    {Math.round(node.strength * 100)}%
                  </span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderNodeDetails = () => {
    if (!selectedNode) return null;
    const positionsMap = visualization ? getNodePositionsMap() : {};
    const pos = positionsMap[selectedNode.id] || { x: 0, y: 0 };
    const colors = getNodeColor(selectedNode);
    const Icon = getNodeIcon(selectedNode.type);

    return (
      <div className="w-64 space-y-3 p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {selectedNode.type}
          </Badge>
          <span className="font-medium text-sm">Details</span>
        </div>
        <p className="text-sm">{selectedNode.text_full || selectedNode.text}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Strength</span>
            <span className="font-medium">{Math.round(selectedNode.strength * 100)}%</span>
          </div>
          <Progress value={selectedNode.strength * 100} className="h-2" />
        </div>

        {selectedNode.issues.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Issues Detected</p>
            <div className="flex flex-wrap gap-1">
              {selectedNode.issues.map(issue => (
                <Badge key={issue} variant="destructive" className="text-[10px]">
                  {issue.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                <Move className="h-3 w-3" />
                <span>Drag to pan</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleFitToView}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <span className="text-red-600 dark:text-red-400">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="text-primary" size={20} />
                  Input Your Argument
                </CardTitle>
                <CardDescription>
                  Enter your argument text to generate a mind map
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your argument here...

Example: Climate change is primarily caused by human activities. This is because burning fossil fuels releases greenhouse gases. Studies show that CO2 levels have increased by 40% since pre-industrial times. Therefore, we must reduce carbon emissions to mitigate climate change."
                  className="min-h-[250px] resize-none"
                />
                <Button 
                  onClick={handleVisualize} 
                  disabled={!text.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Network className="mr-2 h-4 w-4" />
                      Generate Mind Map
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-[600px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="text-primary" size={20} />
                      Argument Mind Map
                    </CardTitle>
                    <CardDescription>
                      Visual structure of your argument
                    </CardDescription>
                  </div>
                  {visualization && visualization.nodes.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-muted-foreground">Strong</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-muted-foreground">Weak</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-muted-foreground">Issues</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {!visualization && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Network className="h-20 w-20 mb-4 opacity-30" />
                    <p className="text-center">Enter an argument and click generate to see the mind map</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Analyzing argument structure...</p>
                  </div>
                )}

                {visualization && visualization.nodes.length > 0 && (
                  <div className="h-full flex gap-4">
                    <div 
                      ref={canvasRef}
                      className="flex-1 bg-muted/20 rounded-lg overflow-hidden border"
                    >
                      {renderCanvas()}
                    </div>

                    {selectedNode && renderNodeDetails()}
                  </div>
                )}

                {visualization && visualization.nodes.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
                    <p>No argument structure could be detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}