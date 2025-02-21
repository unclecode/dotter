import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

const DotEffectProcessor = () => {
    const [image, setImage] = useState(null);
    const [blockSize, setBlockSize] = useState(6);
    const [maxRadius, setMaxRadius] = useState(3);
    const [spacing, setSpacing] = useState(1);
    const [threshold, setThreshold] = useState(20);
    const [darkBackground, setDarkBackground] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const canvasRef = useRef(null);
    const previewRef = useRef(null);
    const fileInputRef = useRef(null);

    const [bgColor, setBgColor] = useState('#000000');
    const [fgColor, setFgColor] = useState('#ffffff');

    

    const processImage = (sourceImage) => {
        const canvas = canvasRef.current;
        const previewContainer = previewRef.current;
        if (!canvas || !previewContainer || !sourceImage) return;

        const ctx = canvas.getContext('2d');

        // Get preview container dimensions
        const previewWidth = previewContainer.clientWidth;
        const previewHeight = previewContainer.clientHeight;

        // First, determine maximum safe canvas dimensions
        const MAX_CANVAS_SIZE = 4096; // Common maximum canvas dimension
        const scale = Math.min(
            MAX_CANVAS_SIZE / sourceImage.width,
            MAX_CANVAS_SIZE / sourceImage.height,
            1
        );

        // Calculate dimensions maintaining aspect ratio
        const imageAspectRatio = sourceImage.width / sourceImage.height;
        const containerAspectRatio = previewWidth / previewHeight;

        let width, height;
        if (imageAspectRatio > containerAspectRatio) {
            // Image is wider than container
            width = Math.min(previewWidth, sourceImage.width * scale);
            height = width / imageAspectRatio;
        } else {
            // Image is taller than container
            height = Math.min(previewHeight, sourceImage.height * scale);
            width = height * imageAspectRatio;
        }

        // Ensure dimensions are integers
        width = Math.floor(width);
        height = Math.floor(height);

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw original image
        ctx.drawImage(sourceImage, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Clear canvas and set background
        // ctx.fillStyle = darkBackground ? 'black' : 'white';
        ctx.fillStyle = darkBackground ? bgColor : fgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw dots
        const stepSize = blockSize + spacing;
        ctx.fillStyle = darkBackground ? fgColor : bgColor;

        for (let y = 0; y < height; y += stepSize) {
            for (let x = 0; x < width; x += stepSize) {
                let totalBrightness = 0;
                let samples = 0;

                // Sample brightness from the block
                for (let sy = 0; sy < blockSize; sy++) {
                    for (let sx = 0; sx < blockSize; sx++) {
                        const sampleX = x + sx;
                        const sampleY = y + sy;
                        if (sampleX < width && sampleY < height) {
                            const pos = (sampleY * width + sampleX) * 4;
                            const brightness = (data[pos] + data[pos + 1] + data[pos + 2]) / 3;
                            totalBrightness += brightness;
                            samples++;
                        }
                    }
                }

                const avgBrightness = totalBrightness / samples;

                // Apply threshold
                if (avgBrightness > (threshold * 2.55)) {
                    const radius = (maxRadius * avgBrightness) / 255;
                    ctx.beginPath();
                    ctx.arc(x + blockSize / 2, y + blockSize / 2, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    };

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    processImage(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Handle window resize
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (image) {
                    processImage(image);
                }
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, [image, blockSize, maxRadius, spacing, threshold, darkBackground]);

    useEffect(() => {
        if (image) {
            processImage(image);
        }
    }, [blockSize, maxRadius, spacing, threshold, darkBackground, bgColor, fgColor]);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Controls Panel - Full width on mobile, fixed width on desktop */}
            <div className={`w-full lg:w-96 p-6 flex flex-col ${darkBackground ? 'bg-black' : 'bg-gray-900'} ${darkBackground ? 'text-gray-600' : 'text-gray-100'}`}>
                <Card className="flex-1">
                    <div className="p-6 space-y-6">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-700'}
                ${image ? 'border-green-500 dark:border-green-700' : ''}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={(e) => handleFile(e.target.files[0])}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Drag and drop an image here, or{' '}
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        browse
                                    </button>
                                </p>
                                {image && <p className="text-sm text-green-600 dark:text-green-400">Image loaded successfully!</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Block Size</Label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={blockSize}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value) && value >= 4) {
                                                    setBlockSize(value);
                                                }
                                            }}
                                            className="w-16 px-2 py-1 text-right text-sm border rounded bg-background dark:bg-card border-gray-300 dark:border-gray-600 border-width-2"
                                        />
                                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">px</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[blockSize]}
                                    onValueChange={(value) => setBlockSize(value[0])}
                                    min={4}
                                    max={40}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Max Dot Radius</Label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={maxRadius}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value) && value >= 1) {
                                                    setMaxRadius(value);
                                                }
                                            }}
                                            className="w-16 px-2 py-1 text-right text-sm border rounded bg-background dark:bg-card border-gray-300 dark:border-gray-600 border-width-2"
                                        />
                                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">px</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[maxRadius]}
                                    onValueChange={(value) => setMaxRadius(value[0])}
                                    min={1}
                                    max={20}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Spacing</Label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={spacing}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value) && value >= 0) {
                                                    setSpacing(value);
                                                }
                                            }}
                                            className="w-16 px-2 py-1 text-right text-sm border rounded bg-background dark:bg-card border-gray-300 dark:border-gray-600 border-width-2"
                                        />
                                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">px</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[spacing]}
                                    onValueChange={(value) => setSpacing(value[0])}
                                    min={0}
                                    max={10}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Brightness Threshold</Label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={threshold}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value) && value >= 0 && value <= 100) {
                                                    setThreshold(value);
                                                }
                                            }}
                                            className="w-16 px-2 py-1 text-right text-sm border rounded bg-background dark:bg-card border-gray-300 dark:border-gray-600 border-width-2"
                                        />
                                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[threshold]}
                                    onValueChange={(value) => setThreshold(value[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Background Color</Label>
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                    <Label>Dot Color</Label>
                                    <input
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>Color Switch</Label>
                                <Switch
                                    checked={darkBackground}
                                    onCheckedChange={setDarkBackground}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Version 1.0.0, check the repo <a href="https://github.com/unclecode/dotter" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">https://github.com/unclecode/dotter</a>
                </footer>
            </div>

            {/* Preview Panel - Full width and height below controls on mobile, takes remaining width on desktop */}
            <div
                ref={previewRef}
                className={`flex-1 flex items-center justify-center p-6 h-[50vh] lg:h-screen ${darkBackground ? 'bg-black' : 'bg-gray-900'}`}
            >
                <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full"
                />
            </div>
        </div>
    );
};

export default DotEffectProcessor;
