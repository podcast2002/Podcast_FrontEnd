'use client'

import { usePodcastStore } from "@/app/store/podcastStore";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EditPodcast() {
    const { updatePodcast, podcasts, isLoading, error } = usePodcastStore();
    const router = useRouter();
    const params = useParams();
    const podcastId = params.id as string;
    
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [isLoadingPodcast, setIsLoadingPodcast] = useState(true);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Find the podcast to edit
    const podcast = podcasts.find(p => p._id === podcastId);

    useEffect(() => {
        if (podcast) {
            setFormData({
                title: podcast.title,
                description: podcast.description
            });
            setCurrentImageUrl(podcast.coverImageUrl || null);
            setIsLoadingPodcast(false);
        } else if (podcasts.length > 0) {
            // Podcast not found
            router.push('/admin/podcasts/list');
        }
    }, [podcast, podcasts, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setFormErrors(prev => ({
                    ...prev,
                    coverImage: 'Please select a valid image file'
                }));
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setFormErrors(prev => ({
                    ...prev,
                    coverImage: 'Image size must be less than 5MB'
                }));
                return;
            }
            
            setCoverImage(file);
            setFormErrors(prev => ({
                ...prev,
                coverImage: ''
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setCoverImage(null);
        setImagePreview(null);
        setCurrentImageUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters';
        } else if (formData.title.trim().length > 200) {
            errors.title = 'Title must be less than 200 characters';
        }
        
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters';
        } else if (formData.description.trim().length > 2000) {
            errors.description = 'Description must be less than 2000 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsUploading(true);
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            
            if (coverImage) {
                formDataToSend.append('coverImage', coverImage);
            }
            
            await updatePodcast(podcastId, formDataToSend);
            
            // Redirect to podcasts list on success
            router.push('/admin/podcasts/list');
        } catch (err) {
            console.error('Error updating podcast:', err);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingPodcast) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading podcast...</p>
                </div>
            </div>
        );
    }

    if (!podcast) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <p className="font-medium">Podcast not found</p>
                        <Link href="/admin/podcasts/list" className="text-blue-600 hover:text-blue-700">
                            Return to podcasts list
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <Link
                            href="/admin/podcasts/list"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Podcasts
                        </Link>
                    </div>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Podcast</h1>
                        <p className="mt-2 text-gray-600">
                            Update your podcast information and cover image
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title Field */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Podcast Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter podcast title..."
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    formErrors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                                maxLength={200}
                            />
                            {formErrors.title && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.title.length}/200 characters
                            </p>
                        </div>

                        {/* Description Field */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter podcast description..."
                                rows={4}
                                className={`w-full px-4 py-3 font-math border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                                }`}
                                maxLength={2000}
                            />
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.description.length}/2000 characters
                            </p>
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cover Image
                            </label>
                            
                            {!imagePreview && !currentImageUrl ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        Upload cover image
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Click to browse or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview || currentImageUrl || ''}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 cursor-pointer bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                            title="Change image"
                                        >
                                            <Upload className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="p-2 cursor-pointer bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            title="Remove image"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            )}
                            
                            {formErrors.coverImage && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.coverImage}</p>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                <p className="font-medium">Error updating podcast</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex items-center md:flex-row flex-col-reverse gap-2.5 justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href="/admin/podcasts/list"
                                className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={isLoading || isUploading}
                                className="px-6 py-3 cursor-pointer text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {(isLoading || isUploading) ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {isUploading ? 'Uploading...' : 'Updating...'}
                                    </>
                                ) : (
                                    'Update Podcast'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                    
                    <div className="max-w-sm">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                            {imagePreview || currentImageUrl ? (
                                <img
                                    src={imagePreview || currentImageUrl || ''}
                                    alt="Cover preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">
                            {formData.title || 'Podcast Title'}
                        </h4>
                        <p className="text-sm text-gray-600 font-math">
                            {formData.description || 'Podcast description will appear here...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditPodcast;
