import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Group, Text } from 'react-konva';
import useImage from 'use-image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Maximize, 
  Trash2, 
  Sparkles, 
  Download, 
  MousePointer2, 
  Hand,
  Search,
  ChevronRight,
  Loader2,
  X,
  Image as ImageIcon,
  Aperture
} from 'lucide-react';

interface CanvasElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  rotation: number;
}

interface URLImageProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
}

const URLImage: React.FC<URLImageProps> = ({ element, isSelected, onSelect, onChange }) => {
  const [img] = useImage(element.src, 'anonymous');
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        draggable
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

interface FreeCanvasProps {
  onGenerate: (prompt: string) => Promise<string | null>;
  libraryImages: string[];
}

export const FreeCanvas: React.FC<FreeCanvasProps> = ({ onGenerate, libraryImages }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePos({
      x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale,
    });
  };

  const addImage = (src: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newElement: CanvasElement = {
      id,
      type: 'image',
      src,
      x: -stagePos.x / stageScale + 100,
      y: -stagePos.y / stageScale + 100,
      width: 300,
      height: 300,
      rotation: 0,
    };
    setElements([...elements, newElement]);
    setSelectedId(id);
    setShowLibrary(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const img = await onGenerate(prompt);
      if (img) {
        addImage(img);
        setPrompt('');
      }
    } catch (error) {
      console.error("Canvas generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const resetView = () => {
    setStageScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  const centerView = () => {
    if (elements.length === 0) {
      resetView();
      return;
    }

    // Calculate bounding box of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newScale = Math.min(
      (dimensions.width * 0.8) / (maxX - minX),
      (dimensions.height * 0.8) / (maxY - minY),
      1.5
    );

    setStageScale(newScale);
    setStagePos({
      x: dimensions.width / 2 - centerX * newScale,
      y: dimensions.height / 2 - centerY * newScale,
    });
  };

  const bringToFront = () => {
    if (selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el) {
        setElements(prev => [...prev.filter(e => e.id !== selectedId), el]);
      }
    }
  };

  const sendToBack = () => {
    if (selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el) {
        setElements(prev => [el, ...prev.filter(e => e.id !== selectedId)]);
      }
    }
  };

  const clearCanvas = () => {
    if (window.confirm('确定要清空画布吗？')) {
      setElements([]);
      setSelectedId(null);
    }
  };

  const downloadCanvas = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `canvas-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#EBEBE8] overflow-hidden flex flex-col" ref={containerRef}>
      {/* Canvas Toolbar */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-black/5 shadow-xl">
        <button 
          onClick={() => setIsPanning(false)}
          className={`p-2.5 rounded-xl transition-all ${!isPanning ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-[#1A1A1A]/60 hover:bg-black/5'}`}
          title="选择"
        >
          <MousePointer2 size={18} />
        </button>
        <button 
          onClick={() => setIsPanning(true)}
          className={`p-2.5 rounded-xl transition-all ${isPanning ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-[#1A1A1A]/60 hover:bg-black/5'}`}
          title="平移"
        >
          <Hand size={18} />
        </button>
        <div className="w-px h-6 bg-black/10 mx-1" />
        <button 
          onClick={() => setStageScale(s => s * 1.1)}
          className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
          title="放大"
        >
          <Plus size={18} />
        </button>
        <button 
          onClick={() => setStageScale(s => s / 1.1)}
          className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
          title="缩小"
        >
          <Minus size={18} />
        </button>
        <button 
          onClick={resetView}
          className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
          title="重置视图"
        >
          <Maximize size={18} />
        </button>
        <button 
          onClick={centerView}
          className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
          title="居中视图"
        >
          <Aperture size={18} />
        </button>
        <div className="w-px h-6 bg-black/10 mx-1" />
        <button 
          onClick={downloadCanvas}
          className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
          title="下载画布"
        >
          <Download size={18} />
        </button>
        <button 
          onClick={clearCanvas}
          className="p-2.5 text-[#1A1A1A]/60 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
          title="清空画布"
        >
          <X size={18} />
        </button>
        {selectedId && (
          <>
            <div className="w-px h-6 bg-black/10 mx-1" />
            <button 
              onClick={bringToFront}
              className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
              title="置于顶层"
            >
              <ChevronRight size={18} className="-rotate-90" />
            </button>
            <button 
              onClick={sendToBack}
              className="p-2.5 text-[#1A1A1A]/60 hover:bg-black/5 rounded-xl transition-all"
              title="置于底层"
            >
              <ChevronRight size={18} className="rotate-90" />
            </button>
            <button 
              onClick={removeSelected}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="删除选中"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      {/* Floating AI Input */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#6B6A4C] blur-3xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-700" />
          <div className="relative flex items-center bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/20 p-2 overflow-hidden">
            <button 
              onClick={() => setShowLibrary(!showLibrary)}
              className="p-4 text-[#1A1A1A]/40 hover:text-[#6B6A4C] hover:bg-[#6B6A4C]/5 rounded-2xl transition-all"
              title="从图库添加"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="在画布上生成新的建筑灵感..."
              className="flex-1 px-4 py-4 text-sm font-medium outline-none bg-transparent placeholder:text-[#1A1A1A]/30"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl hover:bg-black transition-all disabled:opacity-30 flex items-center gap-2 font-bold text-xs tracking-widest uppercase"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>生成</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Library Drawer */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]/60">我的图库</h3>
              <button onClick={() => setShowLibrary(false)} className="p-1 hover:bg-black/5 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto grid grid-cols-4 gap-3">
              {libraryImages.length > 0 ? (
                libraryImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => addImage(img)}
                    className="aspect-square rounded-xl overflow-hidden border border-black/5 hover:border-[#6B6A4C] transition-all group"
                  >
                    <img src={img} alt="library" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </button>
                ))
              ) : (
                <div className="col-span-4 py-12 text-center text-[#1A1A1A]/40 text-sm">
                  图库暂无内容，请先在造像工坊生成
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Stage */}
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        draggable={isPanning}
        ref={stageRef}
        onMouseDown={(e) => {
          // deselect when clicked on empty area
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            setSelectedId(null);
          }
        }}
        className="cursor-crosshair"
      >
        <Layer>
          {/* Background Grid (Optional, but helps with orientation) */}
          <Rect 
            x={-5000} 
            y={-5000} 
            width={10000} 
            height={10000} 
            fill="#EBEBE8"
          />
          
          {elements.map((el) => (
            <URLImage
              key={el.id}
              element={el}
              isSelected={el.id === selectedId}
              onSelect={() => {
                if (!isPanning) setSelectedId(el.id);
              }}
              onChange={(newAttrs) => {
                const newElements = elements.map((item) => {
                  if (item.id === el.id) {
                    return { ...item, ...newAttrs };
                  }
                  return item;
                });
                setElements(newElements);
              }}
            />
          ))}
        </Layer>
      </Stage>

      {/* Zoom Indicator */}
      <div className="absolute bottom-8 right-8 z-10 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full border border-black/5 shadow-lg text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest">
        Zoom: {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
};
