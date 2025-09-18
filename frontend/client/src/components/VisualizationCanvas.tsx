import React, { useState, useRef, useEffect } from 'react';

interface VisualizationCanvasProps {
  visualization: any | null;
  onDrawingSubmit?: (drawingData: string) => void;
  onlyDrawing?: boolean;
  allowSubmit?: boolean;
}

interface DrawData {
    x: number;
    y: number;
    lineColor: string;
    lineWidth: number;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ 
  visualization,
  onDrawingSubmit,
  onlyDrawing,
  allowSubmit,
}) => {
  const allowToggleDrawMode = !onlyDrawing;
  const allowSubmitDrawing = !!allowSubmit;

  // Drawing states
  const [isDrawMode, setIsDrawMode] = useState(!allowToggleDrawMode);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [currentPath, setCurrentPath] = useState<DrawData[]>([]);
  const [paths, setPaths] = useState<DrawData[][]>([]);
  const currentPathRef = useRef(currentPath);
  const pathsRef = useRef(paths);

  useEffect(() => {
      currentPathRef.current = currentPath;
  }, [currentPath]);

  useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  
  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to handle downloading the canvas as an image
  const handleDownloadCanvas = () => {
    if (!canvasRef.current) return;
    
    // Convert the canvas to a data URL and create a download link
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'math-visualization.png';
    link.href = dataUrl;
    link.click();
  };
  
  // Function to clear the canvas
  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  
  // Function to toggle drawing mode
  const toggleDrawMode = () => {
    setIsDrawMode(!isDrawMode);
    
    // If turning off draw mode, clear the current drawing
    if (isDrawMode) {
      setCurrentPath([]);
    }
  };
  
  // Handle drawing submission
  const handleSubmitDrawing = () => {
    if (!canvasRef.current || paths.length === 0) return;
    
    // Create a data URL from the canvas
    const dataUrl = canvasRef.current.toDataURL('image/png');
    
    // Call the submission handler if provided
    if (onDrawingSubmit) {
      onDrawingSubmit(dataUrl);
    }
    
    // Clear the canvas for the next drawing
    clearCanvas();
  };

  
  // Generate a sample SVG visualization for when no data is provided
  const generateSampleVisualization = () => {
    return (
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        {/* X-axis */}
        <line x1="50" y1="200" x2="450" y2="200" stroke="#333" strokeWidth="2" />
        {/* Y-axis */}
        <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="2" />
        
        {/* X-axis arrow */}
        <polygon points="450,200 440,195 440,205" fill="#333" />
        {/* Y-axis arrow */}
        <polygon points="50,50 45,60 55,60" fill="#333" />
        
        {/* X-axis label */}
        <text x="450" y="220" fontSize="14" fill="#333">x</text>
        {/* Y-axis label */}
        <text x="30" y="50" fontSize="14" fill="#333">y</text>
        
        {/* Grid lines (faint) */}
        <g stroke="#ddd" strokeWidth="1">
          {/* Horizontal grid lines */}
          <line x1="50" y1="150" x2="450" y2="150" />
          <line x1="50" y1="100" x2="450" y2="100" />
          <line x1="50" y1="250" x2="450" y2="250" />
          
          {/* Vertical grid lines */}
          <line x1="150" y1="50" x2="150" y2="250" />
          <line x1="250" y1="50" x2="250" y2="250" />
          <line x1="350" y1="50" x2="350" y2="250" />
        </g>
        
        {/* Quadratic function: f(x) = x² */}
        <path
          d="M 50,200 Q 150,50 250,200 T 450,100"
          fill="none"
          stroke="#4A6FFF"
          strokeWidth="3"
        />
        
        {/* Equation label */}
        <text x="350" y="80" fontSize="18" fill="#4A6FFF" fontWeight="bold">
          f(x) = x²
        </text>
      </svg>
    );
  };
  
  // Generate linear function graph SVG
  const generateLinearGraph = (equation: string = "y = 2x + 1", points: any[] = [{x: 0, y: 1}, {x: 1, y: 3}], title: string = "Linear Function") => {
    // Scale the points to the SVG coordinate system
    const scaledPoints = points.map(p => ({
      x: 50 + (p.x * 100),
      y: 200 - (p.y * 50) // Y-axis is inverted in SVG, so subtract
    }));
    
    // Generate path from points
    const pathData = `M ${scaledPoints[0].x},${scaledPoints[0].y} L ${scaledPoints[1].x},${scaledPoints[1].y}`;
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        {/* Axes */}
        <line x1="50" y1="200" x2="450" y2="200" stroke="#333" strokeWidth="2" /> {/* X-axis */}
        <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="2" /> {/* Y-axis */}
        
        {/* Grid lines */}
        <g stroke="#ddd" strokeWidth="1">
          <line x1="50" y1="150" x2="450" y2="150" />
          <line x1="50" y1="100" x2="450" y2="100" />
          <line x1="50" y1="250" x2="450" y2="250" />
          <line x1="150" y1="50" x2="150" y2="250" />
          <line x1="250" y1="50" x2="250" y2="250" />
          <line x1="350" y1="50" x2="350" y2="250" />
        </g>
        
        {/* Linear function line */}
        <path
          d={pathData}
          fill="none"
          stroke="#4A6FFF"
          strokeWidth="3"
        />
        
        {/* Points */}
        {scaledPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="#4A6FFF" />
        ))}
        
        {/* Equation */}
        <text x="350" y="80" fontSize="16" fill="#4A6FFF" fontWeight="bold">
          {equation}
        </text>
        
        {/* Title */}
        <text x="250" y="30" fontSize="18" fill="#333" fontWeight="bold" textAnchor="middle">
          {title}
        </text>
      </svg>
    );
  };
  
  // Generate quadratic function graph SVG
  const generateQuadraticGraph = (equation: string = "y = x² - 4x + 3", points: any[] = [{x: 1, y: 0}, {x: 3, y: 0}], title: string = "Quadratic Function") => {
    // Create a parabola path
    const pathData = `M 50,100 Q 150,250 250,100 T 450,50`;
    
    // Scale points to SVG coordinate system
    const scaledPoints = points.map(p => ({
      x: 50 + (p.x * 100),
      y: 200 - (p.y * 50)
    }));
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        {/* Axes */}
        <line x1="50" y1="200" x2="450" y2="200" stroke="#333" strokeWidth="2" /> {/* X-axis */}
        <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="2" /> {/* Y-axis */}
        
        {/* Grid lines */}
        <g stroke="#ddd" strokeWidth="1">
          <line x1="50" y1="150" x2="450" y2="150" />
          <line x1="50" y1="100" x2="450" y2="100" />
          <line x1="50" y1="250" x2="450" y2="250" />
          <line x1="150" y1="50" x2="150" y2="250" />
          <line x1="250" y1="50" x2="250" y2="250" />
          <line x1="350" y1="50" x2="350" y2="250" />
        </g>
        
        {/* Quadratic function curve */}
        <path
          d={pathData}
          fill="none"
          stroke="#4A6FFF"
          strokeWidth="3"
        />
        
        {/* Points (roots) */}
        {scaledPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="#4A6FFF" />
        ))}
        
        {/* Equation */}
        <text x="350" y="80" fontSize="16" fill="#4A6FFF" fontWeight="bold">
          {equation}
        </text>
        
        {/* Title */}
        <text x="250" y="30" fontSize="18" fill="#333" fontWeight="bold" textAnchor="middle">
          {title}
        </text>
      </svg>
    );
  };
  
  // Generate a triangle angles diagram
  const generateTriangleAnglesSVG = (data: any = {}) => {
    const title = data.title || "Triangle Interior Angles";
    const angles = data.angles || ["60°", "60°", "60°"];
    const labels = data.labels || ["A", "B", "C"];
    const formula = data.formula || "∠A + ∠B + ∠C = 180°";
    const explanation = data.explanation || "The sum of interior angles in a triangle is 180°";
    
    return (
      <div className="flex flex-col items-center">
        <svg width="100%" height="220" viewBox="0 0 500 220">
          {/* Triangle */}
          <polygon
            points="250,50 100,200 400,200"
            fill="rgba(74, 111, 255, 0.1)"
            stroke="#4A6FFF"
            strokeWidth="3"
          />
          
          {/* Vertex Labels */}
          <text x="250" y="40" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">{labels[0]}</text>
          <text x="85" y="210" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">{labels[1]}</text>
          <text x="415" y="210" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">{labels[2]}</text>
          
          {/* Angle Arcs */}
          <path d="M 250,80 A 30,30 0 0,0 225,65" fill="none" stroke="#FF6B6B" strokeWidth="2" />
          <path d="M 130,190 A 30,30 0 0,0 100,175" fill="none" stroke="#FF6B6B" strokeWidth="2" />
          <path d="M 370,190 A 30,30 0 0,0 400,175" fill="none" stroke="#FF6B6B" strokeWidth="2" />
          
          {/* Angle Labels */}
          <text x="240" y="70" fontSize="14" fill="#FF6B6B" fontWeight="bold">{angles[0]}</text>
          <text x="115" y="185" fontSize="14" fill="#FF6B6B" fontWeight="bold">{angles[1]}</text>
          <text x="385" y="185" fontSize="14" fill="#FF6B6B" fontWeight="bold">{angles[2]}</text>
          
          {/* Title */}
          <text x="250" y="20" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">
            {title}
          </text>
        </svg>
        
        {/* Formula */}
        <div className="mt-4 p-2 bg-blue-50 rounded-md border border-blue-200 text-center">
          <div className="font-mono text-lg font-bold text-primary">{formula}</div>
          <div className="text-sm text-gray-600 mt-1">{explanation}</div>
        </div>
      </div>
    );
  };
  
  // Generate a simple diagram (triangle, circle, etc.)
  const generateDiagramSVG = (shape: string = "triangle", title: string = "Geometric Shape") => {
    if (shape === "triangle") {
      return (
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          {/* Triangle */}
          <polygon
            points="250,50 100,250 400,250"
            fill="none"
            stroke="#4A6FFF"
            strokeWidth="3"
          />
          
          {/* Labels */}
          <text x="250" y="40" fontSize="14" fill="#333" textAnchor="middle">A</text>
          <text x="85" y="250" fontSize="14" fill="#333" textAnchor="middle">B</text>
          <text x="415" y="250" fontSize="14" fill="#333" textAnchor="middle">C</text>
          
          {/* Angles */}
          <text x="250" y="90" fontSize="12" fill="#4A6FFF">60°</text>
          <text x="130" y="220" fontSize="12" fill="#4A6FFF">60°</text>
          <text x="370" y="220" fontSize="12" fill="#4A6FFF">60°</text>
          
          {/* Title */}
          <text x="250" y="290" fontSize="18" fill="#333" fontWeight="bold" textAnchor="middle">
            {title}
          </text>
        </svg>
      );
    } else if (shape === "circle") {
      return (
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          {/* Circle */}
          <circle
            cx="250"
            cy="150"
            r="100"
            fill="none"
            stroke="#4A6FFF"
            strokeWidth="3"
          />
          
          {/* Radius line */}
          <line x1="250" y1="150" x2="350" y2="150" stroke="#4A6FFF" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* Radius label */}
          <text x="300" y="140" fontSize="16" fill="#4A6FFF">r</text>
          
          {/* Title */}
          <text x="250" y="280" fontSize="18" fill="#333" fontWeight="bold" textAnchor="middle">
            {title}
          </text>
        </svg>
      );
    } else {
      // Default general shape
      return (
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          <text x="250" y="150" fontSize="18" fill="#333" fontWeight="bold" textAnchor="middle">
            {title}
          </text>
        </svg>
      );
    }
  };
  
  // Generate a visualization based on type
  const generateVisualization = () => {
    if (!visualization) return generateSampleVisualization();
    
    const type = visualization.type;
    
    switch (type) {
      case 'graph':
      case 'function':
        if (visualization.equation?.includes('x²')) {
          return generateQuadraticGraph(
            visualization.equation,
            visualization.points || [{x: 1, y: 1}, {x: 2, y: 4}],
            visualization.title || 'Quadratic Function'
          );
        } else {
          return generateLinearGraph(
            visualization.equation || 'y = x',
            visualization.points || [{x: 0, y: 0}, {x: 1, y: 1}],
            visualization.title || 'Linear Function'
          );
        }
      case 'fraction':
        // Create a simple fraction visualization
        return (
          <svg width="100%" height="100%" viewBox="0 0 500 300">
            <rect x="100" y="50" width="300" height="200" fill="none" stroke="#4A6FFF" strokeWidth="3"/>
            <line x1="100" y1="150" x2="400" y2="150" stroke="#4A6FFF" strokeWidth="3"/>
            <text x="250" y="110" fontSize="24" fill="#4A6FFF" textAnchor="middle">
              {visualization.numerator || '1'}
            </text>
            <text x="250" y="200" fontSize="24" fill="#4A6FFF" textAnchor="middle">
              {visualization.denominator || '2'}
            </text>
            <text x="250" y="270" fontSize="18" fill="#333" fontWeight="bold" textAnchor="middle">
              {visualization.title || 'Fraction Representation'}
            </text>
          </svg>
        );
      case 'triangle_angles':
        // Use our specialized triangle angles diagram
        return generateTriangleAnglesSVG(visualization);
      case 'diagram':
        return generateDiagramSVG(
          visualization.shape,
          visualization.title
        );
      case 'general':
        // For general explanations, just show the title and steps
        return (
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3">{visualization.title}</h3>
            {visualization.steps && (
              <ul className="list-decimal list-inside">
                {visualization.steps.map((step: string, i: number) => (
                  <li key={i} className="mb-2">{step}</li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return generateSampleVisualization();
    }
  };

  // Function to render all paths
  const renderPaths = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize;

    const allPaths = [...pathsRef.current, currentPathRef.current]

    allPaths.forEach(path => {
      if (path.length < 2) return;

      ctx.lineWidth = path[0].lineWidth;
      ctx.strokeStyle = path[0].lineColor;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }

      ctx.stroke();
    });
  };
  
  // Drawing handlers
  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawMode) return;
    
    setIsDrawing(true);
    const { x, y } = getEventPosition(e);
    const newPath = [{ x, y, lineColor: drawingColor, lineWidth: brushSize }];

    setCurrentPath(newPath);
  };
  
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !isDrawing || !canvasRef.current) return;

    e.preventDefault();

    const { x, y } = getEventPosition(e);
    const updatedPath = [...currentPath, { x, y, lineColor: drawingColor, lineWidth: brushSize }];
    setCurrentPath(updatedPath);
    renderPaths();
  };
  
  const handleEndDrawing = () => {
    if (!isDrawMode || !isDrawing) return;
    renderPaths();
    setPaths(prevPaths => [...prevPaths, currentPath]);
    setIsDrawing(false);
    setCurrentPath([]);
  };

  // Canvas drawing handlers
  useEffect(() => {
    if (!canvasRef.current || !isDrawMode) return;

    const resizeCanvas = () => {
      if (canvasRef.current && canvasContainerRef.current) {
          const { width, height } = canvasContainerRef.current.getBoundingClientRect();
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          renderPaths();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDrawMode]);

    // Helper function to get cursor/touch position
  const getEventPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  
  return (
    <div className="math-canvas h-full flex-grow flex flex-col">
      <div className="bg-white p-3 rounded-t-lg border-b-2 border-neutral-200 flex justify-between items-center">
        <h2 className="font-bold text-primary font-['Nunito']">Visual Workspace</h2>
        <div className="flex items-center gap-2">
          {allowToggleDrawMode &&
          <button
            className={`${isDrawMode ? 'bg-blue-500 text-white' : 'bg-neutral-100 text-neutral-700'} rounded-lg py-1 px-3 text-sm transition-colors duration-200 flex items-center gap-1`}
            onClick={toggleDrawMode}
          >
            <span>✏️</span>
            <span>{isDrawMode ? 'Exit Draw Mode' : 'Draw'}</span>
          </button>
          }
          
          <button 
            className="bg-neutral-300 hover:bg-neutral-400 text-neutral-900 rounded-lg py-1 px-2 text-sm transition-colors duration-200"
            onClick={handleDownloadCanvas}
          >
            📥 Save
          </button>
        </div>
      </div>
      
      <div className="flex-grow rounded-b-lg relative bg-white p-4 overflow-auto">
        {isDrawMode ? (
          <div 
            ref={canvasContainerRef}
            className="w-full h-full relative bg-neutral-50 rounded-md overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              onMouseDown={handleStartDrawing}
              onMouseMove={handleDraw}
              onMouseUp={handleEndDrawing}
              onMouseLeave={handleEndDrawing}
              onTouchStart={handleStartDrawing}
              onTouchMove={handleDraw}
              onTouchEnd={handleEndDrawing}
            />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <div className="bg-white rounded-lg shadow-md p-2 flex items-center gap-3">
                <div className="flex gap-1">
                  {['#000000', '#4A6FFF', '#FF6B6B', '#2DCA8C', '#FFB700'].map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full ${color === drawingColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setDrawingColor(color)}
                    />
                  ))}
                </div>
                
                <div className="h-6 border-l border-neutral-300"></div>
                
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1 hover:bg-neutral-100 rounded"
                    onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm">{brushSize}px</span>
                  <button 
                    className="p-1 hover:bg-neutral-100 rounded"
                    onClick={() => setBrushSize(Math.min(20, brushSize + 1))}
                  >
                    +
                  </button>
                </div>
                
                <div className="h-6 border-l border-neutral-300"></div>
                
                <button
                  className="bg-neutral-100 hover:bg-neutral-200 rounded-md px-3 py-1 text-sm"
                  onClick={clearCanvas}
                >
                  Clear
                </button>

                {allowSubmitDrawing &&
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-3 py-1 text-sm ml-2"
                    onClick={handleSubmitDrawing}
                  >
                    Submit
                  </button>
                }
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Display the appropriate visualization based on the AI's response */}
            {generateVisualization()}
            
            {/* Show some metadata if available */}
            {visualization && visualization.title && (
              <div className="mt-4 text-sm text-gray-500">
                <div>⚡ Visual representation: {visualization.title}</div>
                {visualization.type && <div>🔍 Type: {visualization.type}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VisualizationCanvas;
