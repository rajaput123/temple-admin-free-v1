import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Upload, 
  X, 
  AlertCircle, 
  Loader2,
  Image as ImageIcon,
  Video,
  File,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import type { SocialPlatform } from '@/types/pr-communication';
import '@/styles/pr-communication.css';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (data: {
    content: string;
    platforms: SocialPlatform[];
    mediaFiles?: File[];
  }) => void;
}

const platformOptions: { value: SocialPlatform; label: string; icon: any }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
];

export function CreatePostModal({ open, onOpenChange, onPost }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{
    content?: string;
    platforms?: string;
  }>({});
  const [isPosting, setIsPosting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      const newSelection = prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform];
      if (errors.platforms) {
        setErrors(prevErrors => ({ ...prevErrors, platforms: undefined }));
      }
      return newSelection;
    });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('video/')) return Video;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!content.trim()) {
      newErrors.content = 'Caption is required';
    }

    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (!validateForm()) {
      return;
    }

    setIsPosting(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

    onPost({
      content,
      platforms: selectedPlatforms,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
    });

    // Reset form
    setContent('');
    setSelectedPlatforms([]);
    setMediaFiles([]);
    setErrors({});
    setIsPosting(false);
  };

  const handleClose = () => {
    if (!isPosting) {
      setContent('');
      setSelectedPlatforms([]);
      setMediaFiles([]);
      setErrors({});
      onOpenChange(false);
    }
  };

  const getCharacterCount = () => content.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create Post
          </DialogTitle>
          <DialogDescription>
            Write your post caption, upload media, and select platforms to publish
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-4">
          <div className="flex flex-col gap-6">
            {/* Caption Section */}
            <div className="space-y-3">
              <Label htmlFor="caption" className="text-base font-semibold">
                Caption <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="caption"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors(prev => ({ ...prev, content: undefined }));
                  }
                }}
                placeholder="Write your post caption..."
                className={`min-h-[120px] resize-y ${errors.content ? 'border-destructive' : ''}`}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{getCharacterCount()} characters</span>
                {errors.content && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.content}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Media Upload
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-muted p-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Upload image or video
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaFiles.map((file, index) => {
                    const Icon = getFileIcon(file);
                    const isImage = file.type.startsWith('image/');
                    const previewUrl = isImage ? URL.createObjectURL(file) : null;
                    
                    return (
                      <div
                        key={index}
                        className="relative group border rounded-lg overflow-hidden bg-muted/50"
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleFileRemove(index)}
                            className="gap-1"
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate px-2">
                          {file.name}
                        </div>
                        <div className="absolute top-1 right-1">
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platforms Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Platforms <span className="text-destructive">*</span>
                </Label>
                {selectedPlatforms.length > 0 && (
                  <Badge variant="secondary">
                    {selectedPlatforms.length} selected
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {platformOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedPlatforms.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handlePlatformToggle(option.value)}
                      className={`flex items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      } ${errors.platforms ? 'border-destructive' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.platforms && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.platforms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPosting}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={isPosting || !content.trim() || selectedPlatforms.length === 0}
            className="gap-2 min-w-[140px]"
          >
            {isPosting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Post Now
                {selectedPlatforms.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedPlatforms.length}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
