'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageUpload({ value, onChange, placeholder = "Upload image" }) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value || '');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            alert('Image size should be less than 50MB');
            return;
        }

        setIsUploading(true);
        
        try {
            // Create preview and base64 in separate FileReader instances
            const previewReader = new FileReader();
            const base64Reader = new FileReader();
            
            // Set preview
            previewReader.onload = (e) => {
                setPreview(e.target.result);
            };
            previewReader.readAsDataURL(file);

            // Convert to base64 for storage
            const base64 = await new Promise((resolve, reject) => {
                base64Reader.onload = (e) => resolve(e.target.result);
                base64Reader.onerror = reject;
                base64Reader.readAsDataURL(file);
            });

            onChange(base64);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image</label>
            <div className="relative">
                {preview ? (
                    <div className="relative group">
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-xl border border-border-custom"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-border-custom rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-sm">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Upload size={24} />
                                <span className="text-sm">{placeholder}</span>
                                <span className="text-xs">or drag and drop</span>
                            </div>
                        )}
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
            
            {/* Alternative URL input */}
            <div className="mt-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Or Image URL</label>
                <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="url" 
                        placeholder="https://..." 
                        value={!preview.startsWith('data:') ? value : ''}
                        onChange={(e) => {
                            const url = e.target.value;
                            if (url) {
                                setPreview(url);
                                onChange(url);
                            }
                        }}
                        className="w-full bg-background border border-border-custom rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
