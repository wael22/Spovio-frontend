import { useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
    onImagesChange: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
}

const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 5;
const MAX_FILES = 3;

export function ImageUpload({
    onImagesChange,
    maxFiles = MAX_FILES,
    maxSizeMB = MAX_SIZE_MB
}: ImageUploadProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    const validateFile = (file: File): boolean => {
        // Check format
        if (!ACCEPTED_FORMATS.includes(file.type)) {
            toast.error(`Format non supporté: ${file.name}. Utilisez PNG ou JPG.`);
            return false;
        }

        // Check size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            toast.error(`Fichier trop volumineux: ${file.name} (${sizeMB.toFixed(1)}MB). Max: ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);

        // Check total number
        if (selectedFiles.length + fileArray.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} images autorisées`);
            return;
        }

        // Validate each file
        const validFiles = fileArray.filter(validateFile);
        if (validFiles.length === 0) return;

        // Create previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));

        const updatedFiles = [...selectedFiles, ...validFiles];
        const updatedPreviews = [...previews, ...newPreviews];

        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);
        onImagesChange(updatedFiles);

        toast.success(`${validFiles.length} image(s) ajoutée(s)`);
    }, [selectedFiles, previews, maxFiles, maxSizeMB, onImagesChange]);

    const removeFile = (index: number) => {
        // Revoke preview URL to free memory
        URL.revokeObjectURL(previews[index]);

        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        onImagesChange(newFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        handleFiles(e.dataTransfer.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const totalSizeMB = selectedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept={ACCEPTED_FORMATS.join(',')}
                    multiple
                    onChange={handleChange}
                    disabled={selectedFiles.length >= maxFiles}
                />

                <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                >
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                        Cliquez pour ajouter des images
                    </p>
                    <p className="text-xs text-muted-foreground">
                        ou glissez-déposez • PNG, JPG • Max {maxSizeMB}MB • {maxFiles} images max
                    </p>
                </label>
            </div>

            {/* Preview Grid */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {selectedFiles.length} / {maxFiles} images
                        </span>
                        <span className="text-muted-foreground">
                            {totalSizeMB.toFixed(2)} MB
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {previews.map((preview, index) => (
                            <div
                                key={index}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-border/50"
                            >
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                {/* File info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <p className="text-xs text-white truncate">
                                        {selectedFiles[index].name}
                                    </p>
                                    <p className="text-xs text-white/70">
                                        {(selectedFiles[index].size / 1024).toFixed(0)} KB
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Add More Button */}
                        {selectedFiles.length < maxFiles && (
                            <label
                                htmlFor="image-upload"
                                className="aspect-square rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
                            >
                                <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Ajouter</span>
                            </label>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
