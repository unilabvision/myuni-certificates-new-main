'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PositionConfig {
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  enabled: boolean;
  x_manual: number;
  y_manual: number;
}

interface DesignSettings {
  fonts: {
    body: string;
    name: string;
    title: string;
  };
  colors: {
    name: string;
    text: string;
    primary: string;
    secondary: string;
    institution: string;
    certificate_no: string;
  };
  layout: {
    date_position: PositionConfig;
    name_position: PositionConfig;
    title_position: PositionConfig;
    signature_position: PositionConfig;
    description_position: PositionConfig;
    institution_position: PositionConfig;
    certificate_no_position: PositionConfig;
  };
  font_sizes: {
    date: number;
    name: number;
    title: number;
    signature: number;
    institution: number;
    certificate_no: number;
  };
}

interface AdvancedTemplateEditorProps {
  designSettings: DesignSettings;
  onSettingsChange: (settings: DesignSettings) => void;
  backgroundImageUrl: string;
}

interface DraggableElement {
  id: string;
  type: keyof DesignSettings['layout'];
  config: PositionConfig;
  label: string;
  previewText: string;
  color: string;
  fontSize: number;
}

export default function AdvancedTemplateEditor({ 
  designSettings, 
  onSettingsChange, 
  backgroundImageUrl 
}: AdvancedTemplateEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const elements: DraggableElement[] = [
    {
      id: 'name',
      type: 'name_position',
      config: designSettings.layout.name_position,
      label: 'İsim',
      previewText: 'John Doe',
      color: designSettings.colors.name,
      fontSize: designSettings.font_sizes.name
    },
    {
      id: 'date',
      type: 'date_position',
      config: designSettings.layout.date_position,
      label: 'Tarih',
      previewText: '15 Ocak 2024',
      color: designSettings.colors.text,
      fontSize: designSettings.font_sizes.date
    },
    {
      id: 'title',
      type: 'title_position',
      config: designSettings.layout.title_position,
      label: 'Başlık',
      previewText: 'Başarı Sertifikası',
      color: designSettings.colors.primary,
      fontSize: designSettings.font_sizes.title
    },
    {
      id: 'institution',
      type: 'institution_position',
      config: designSettings.layout.institution_position,
      label: 'Kurum',
      previewText: 'MyUNI Akademi',
      color: designSettings.colors.institution,
      fontSize: designSettings.font_sizes.institution
    },
    {
      id: 'certificate_no',
      type: 'certificate_no_position',
      config: designSettings.layout.certificate_no_position,
      label: 'Sertifika No',
      previewText: 'CERT-2024-001',
      color: designSettings.colors.certificate_no,
      fontSize: designSettings.font_sizes.certificate_no
    }
  ];

  useEffect(() => {
    loadBackgroundImage();
  }, [backgroundImageUrl]);

  const loadBackgroundImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Canvas boyutlarını resme göre ayarla
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      setCanvasSize({ width, height });
      canvas.width = width;
      canvas.height = height;

      // Arka plan resmini çiz
      ctx.drawImage(img, 0, 0, width, height);
      
      // Elementleri çiz
      drawElements();
    };
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  const drawElements = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Arka plan resmini tekrar çiz
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Elementleri çiz
      elements.forEach(element => {
        if (element.config.enabled) {
          drawElement(ctx, element);
        }
      });
    };
    img.src = backgroundImageUrl;
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DraggableElement) => {
    const x = (element.config.x / 100) * canvasSize.width;
    const y = (element.config.y / 100) * canvasSize.height;

    ctx.save();
    ctx.fillStyle = element.color;
    ctx.font = `${element.fontSize * scale}px system-ui, sans-serif`;
    ctx.textAlign = element.config.align;
    ctx.textBaseline = 'middle';

    // Hizalama hesaplama
    let drawX = x;
    if (element.config.align === 'center') {
      drawX = canvasSize.width / 2;
    } else if (element.config.align === 'right') {
      drawX = canvasSize.width - x;
    }

    // Metni çiz
    ctx.fillText(element.previewText, drawX, y);

    // Seçili element için highlight
    if (draggedElement === element.id) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      const metrics = ctx.measureText(element.previewText);
      const padding = 5;
      
      let rectX = drawX;
      if (element.config.align === 'center') {
        rectX = drawX - metrics.width / 2;
      } else if (element.config.align === 'right') {
        rectX = drawX - metrics.width;
      }
      
      ctx.strokeRect(
        rectX - padding, 
        y - element.fontSize * scale / 2 - padding, 
        metrics.width + padding * 2, 
        element.fontSize * scale + padding * 2
      );
    }

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Hangi element'e tıklandığını bul
    const clickedElement = elements.find(element => {
      if (!element.config.enabled) return false;
      
      const elementX = (element.config.x / 100) * canvasSize.width;
      const elementY = (element.config.y / 100) * canvasSize.height;
      
      // Basit collision detection
      const tolerance = 20;
      return Math.abs(x - elementX) < tolerance && Math.abs(y - elementY) < tolerance;
    });

    if (clickedElement) {
      setDraggedElement(clickedElement.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Yüzde koordinatlarına çevir
    const percentX = (x / canvasSize.width) * 100;
    const percentY = (y / canvasSize.height) * 100;

    // Design settings'i güncelle
    const newSettings = { ...designSettings };
    const elementType = elements.find(el => el.id === draggedElement)?.type;
    
    if (elementType) {
      newSettings.layout[elementType] = {
        ...newSettings.layout[elementType],
        x: percentX,
        y: percentY
      };
      
      onSettingsChange(newSettings);
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  const toggleElement = (elementType: keyof DesignSettings['layout']) => {
    const newSettings = { ...designSettings };
    newSettings.layout[elementType].enabled = !newSettings.layout[elementType].enabled;
    onSettingsChange(newSettings);
  };

  const updateFontSize = (elementType: keyof DesignSettings['layout'], size: number) => {
    const newSettings = { ...designSettings };
    const fontSizeKey = elementType.replace('_position', '') as keyof DesignSettings['font_sizes'];
    newSettings.font_sizes[fontSizeKey] = size;
    onSettingsChange(newSettings);
  };

  const updateColor = (elementType: keyof DesignSettings['layout'], color: string) => {
    const newSettings = { ...designSettings };
    const colorKey = elementType.replace('_position', '') as keyof DesignSettings['colors'];
    newSettings.colors[colorKey] = color;
    onSettingsChange(newSettings);
  };

  const updateAlignment = (elementType: keyof DesignSettings['layout'], align: 'left' | 'center' | 'right') => {
    const newSettings = { ...designSettings };
    newSettings.layout[elementType].align = align;
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gelişmiş Şablon Düzenleyici</h3>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-700">Zoom:</label>
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
            <option value={1.25}>125%</option>
            <option value={1.5}>150%</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
            />
          </div>
        </div>

        {/* Kontroller */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Element Kontrolleri</h4>
          
          {elements.map((element) => (
            <div key={element.id} className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {element.label}
                </label>
                <input
                  type="checkbox"
                  checked={element.config.enabled}
                  onChange={() => toggleElement(element.type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {element.config.enabled && (
                <>
                  {/* Font Boyutu */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Boyutu</label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={element.fontSize}
                      onChange={(e) => updateFontSize(element.type, Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{element.fontSize}px</span>
                  </div>

                  {/* Renk */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Renk</label>
                    <input
                      type="color"
                      value={element.color}
                      onChange={(e) => updateColor(element.type, e.target.value)}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  {/* Hizalama */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hizalama</label>
                    <select
                      value={element.config.align}
                      onChange={(e) => updateAlignment(element.type, e.target.value as 'left' | 'center' | 'right')}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="left">Sola</option>
                      <option value="center">Ortaya</option>
                      <option value="right">Sağa</option>
                    </select>
                  </div>

                  {/* Pozisyon Bilgisi */}
                  <div className="text-xs text-gray-500">
                    <div>X: {element.config.x.toFixed(1)}%</div>
                    <div>Y: {element.config.y.toFixed(1)}%</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Kullanım Talimatları</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Elementleri etkinleştirmek için checkbox&apos;ları kullanın</li>
          <li>• Canvas üzerinde elementleri sürükleyerek konumlandırın</li>
          <li>• Font boyutlarını, renkleri ve hizalamaları sağ panelden ayarlayın</li>
          <li>• Zoom seviyesini değiştirerek detaylı düzenleme yapın</li>
        </ul>
      </div>
    </div>
  );
}
