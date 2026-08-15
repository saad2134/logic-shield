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
  Move,
  Download,
  X,
  Eye,
  Copy,
  Check
} from "lucide-react";
import { api, ArgumentVisualization, ArgumentNode, ArgumentEdge } from "@/lib/api-app";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [copiedNodeId, setCopiedNodeId] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const preventDefaultWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom(prev => Math.min(prev + 0.1, 2));
      } else {
        setZoom(prev => Math.max(prev - 0.1, 0.4));
      }
    };

    svg.addEventListener("wheel", preventDefaultWheel, { passive: false });
    return () => {
      svg.removeEventListener("wheel", preventDefaultWheel);
    };
  }, [visualization]);

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

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

  const handleExportPng = () => {
    if (!canvasRef.current) return;
    const svgElement = canvasRef.current.querySelector("svg");
    if (!svgElement) return;

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1200; // high res
          canvas.height = 750;
          const context = canvas.getContext("2d");
          if (context) {
            context.fillStyle = "#ffffff"; // white background
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            const png = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = png;
            downloadLink.download = "argument_map.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          }
        } catch (err) {
          console.warn("Exporting to PNG failed due to tainted canvas or other error. Downloading SVG instead:", err);
          const downloadLink = document.createElement("a");
          downloadLink.href = blobURL;
          downloadLink.download = "argument_map.svg";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } finally {
          URL.revokeObjectURL(blobURL);
        }
      };
      
      // Fallback: If drawing to canvas fails (due to foreignObject browser security restriction), download the SVG directly.
      image.onerror = () => {
        const downloadLink = document.createElement("a");
        downloadLink.href = blobURL;
        downloadLink.download = "argument_map.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
      };
      
      image.src = blobURL;
    } catch (err) {
      console.error("Failed to export:", err);
    }
  };

  const getNodeColor = (node: ArgumentNode) => {
    if (node.issues.length > 0) return { bg: "bg-red-500", border: "border-red-500", text: "text-red-500", hex: "#ef4444", bgLightHex: "rgba(239, 68, 68, 0.1)" };
    if (node.strength < 0.7) return { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-500", hex: "#eab308", bgLightHex: "rgba(234, 179, 8, 0.1)" };
    return { bg: "bg-green-500", border: "border-green-500", text: "text-green-500", hex: "#22c55e", bgLightHex: "rgba(34, 197, 94, 0.1)" };
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
        ref={svgRef}
        className="w-full h-full select-none"
        viewBox="0 0 800 500"
        style={{ 
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
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
                       fill="white"
                       stroke="#e2e8f0"
                       strokeWidth="1"
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
                  stroke={isSelected ? "#3b82f6" : colors.hex}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected ? "url(#glow)" : "url(#shadow)"}
                  className="dark:fill-slate-800"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill="white"
                  stroke={colors.hex}
                  strokeWidth="1"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill={colors.hex}
                  opacity="0.1"
                />
                <Icon 
                  size={20} 
                  x={pos.x - 10} 
                  y={pos.y - 10} 
                  color={colors.hex}
                />
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
                <rect
                  x={(pos?.x || 0) - 18}
                  y={(pos?.y || 0) - 58}
                  width="36"
                  height="16"
                  rx="8"
                  fill={colors.hex}
                />
                <text
                  x={pos?.x || 0}
                  y={(pos?.y || 0) - 47}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  {Math.round(node.strength * 100)}%
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  const handleCopyText = (textToCopy: string, nodeId: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedNodeId(nodeId);
    setTimeout(() => setCopiedNodeId(null), 2000);
  };

  const renderNodeDetails = () => {
    if (!selectedNode) return null;
    const positionsMap = visualization ? getNodePositionsMap() : {};
    const pos = positionsMap[selectedNode.id] || { x: 0, y: 0 };
    const colors = getNodeColor(selectedNode);
    const Icon = getNodeIcon(selectedNode.type);

    return (
      <div className="w-80 md:w-96 flex-shrink-0 space-y-4 p-4 rounded-lg border bg-muted/30 overflow-y-auto max-h-full">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {selectedNode.type}
          </Badge>
          <span className="font-medium text-sm">Details</span>
        </div>
        <p className="text-sm text-foreground/90 font-medium leading-relaxed">
          {selectedNode.text_full || selectedNode.text}
        </p>
        
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>Strength</span>
            <span className="font-medium" style={{ color: colors.hex }}>{Math.round(selectedNode.strength * 100)}%</span>
          </div>
          <Progress value={selectedNode.strength * 100} className="h-2" />
        </div>

        {selectedNode.issues.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
              <AlertCircle size={14} />
              Issues Detected
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.issues.map(issue => (
                <Badge key={issue} variant="destructive" className="text-[10px] capitalize">
                  {issue.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedNode.suggestions && selectedNode.suggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold flex items-center gap-1.5 text-amber-500">
              <Lightbulb size={14} />
              Suggestions to Strengthen
            </p>
            <ul className="space-y-1.5">
              {selectedNode.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedNode.improved_text && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <Zap size={14} />
              Safer / Stronger Version
            </p>
            <div className="relative p-2.5 rounded bg-primary/5 border border-primary/20 text-xs text-foreground pr-8 group">
              <p className="italic leading-relaxed">"{selectedNode.improved_text}"</p>
              <button
                onClick={() => handleCopyText(selectedNode.improved_text!, selectedNode.id)}
                className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                title="Copy to clipboard"
              >
                {copiedNodeId === selectedNode.id ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

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
            <Card 
              ref={cardRef}
              className={`transition-all duration-300 ${
                isFullscreen 
                  ? "fixed inset-0 z-50 h-screen w-screen bg-background p-6 rounded-none flex flex-col" 
                  : "h-[600px] flex flex-col border-foreground/10 bg-background/50 backdrop-blur-sm shadow-xl"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4 flex-wrap">
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mr-2">
                        <Move className="h-3 w-3" />
                        <span>Drag to pan</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0" title="Zoom Out">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0" title="Zoom In">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleFitToView} className="h-8 w-8 p-0" title="Fit to View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleResetClick} className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" title="Reset Map">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleToggleFullscreen} className="h-8 w-8 p-0" title="Toggle Fullscreen">
                        {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportPng} className="h-8 w-8 p-0" title="Export as PNG">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
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
                      className="flex-1 bg-muted/20 rounded-lg overflow-hidden border relative"
                    >
                      {/* Legend Overlay */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 p-2 rounded-md bg-background/90 backdrop-blur-xs border shadow-sm z-10 pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <span className="text-[10px] font-medium text-foreground">Strong (&ge;70%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <span className="text-[10px] font-medium text-foreground">Weak (&lt;70%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <span className="text-[10px] font-medium text-foreground">Issues Detected</span>
                        </div>
                      </div>

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

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Mind Map</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset and clear the current mind map and input text? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              handleReset();
              setShowResetConfirm(false);
            }}>
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}