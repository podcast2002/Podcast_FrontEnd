'use client';
import { useState, useEffect } from 'react';
import { useEpisodeStore } from '@/app/store/useEpisodeStore';
import { usePodcastStore } from '@/app/store/podcastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  X, 
  Calendar,
  Clock,
  Save,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddEpisode() {
  const { createEpisode, isLoading } = useEpisodeStore();
  const { podcasts, fetchAllPodcasts } = usePodcastStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    members:'',
    description: '',
    podcastId: '',
    releaseDate: '',
    duration: '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPodcasts();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.members.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    if (!formData.podcastId) {
      toast.error('Please select a podcast');
      return;
    }
    
    if (!audioFile) {
      toast.error('Audio file is required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('members',formData.members);
      data.append('description', formData.description);
      data.append('podcastId', formData.podcastId);
      
      if (formData.releaseDate) {
        data.append('releaseDate', formData.releaseDate);
      }
      
      if (formData.duration) {
        data.append('duration', formData.duration);
      }
      
      data.append('audio', audioFile);
      
      if (coverImage) {
        data.append('coverImage', coverImage);
      }

      await createEpisode(data);
      toast.success('Episode created successfully');
      router.push('/admin/episodes/list');
    } catch (error) {
      toast.error('Failed to create episode');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/episodes/list">
            <Button className="cursor-pointer" variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Episode</h1>
            {/* <p className="text-gray-600 mt-1">
              Create a new podcast episode
            </p> */}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Episode Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter episode title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="podcast">Podcast *</Label>
                <Select value={formData.podcastId} onValueChange={(value) => handleInputChange('podcastId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a podcast" />
                  </SelectTrigger>
                  <SelectContent>
                    {podcasts.map((podcast) => (
                      <SelectItem key={podcast._id} value={podcast._id}>
                        {podcast.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="members">Guest *</Label>
                <Input
                  id="members"
                  placeholder="Enter episode members"
                  value={formData.members}
                  onChange={(e) => handleInputChange('members', e.target.value)}
                  required
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter episode description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 1800"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Files */}
        <Card>
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio File */}
            <div className="space-y-4">
              <Label>Audio File *</Label>
              {!audioFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">Upload audio file</p>
                  <p className="text-sm text-gray-500 mb-4">MP3, WAV, M4A supported</p>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{audioFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={removeAudioFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {audioPreview && (
                    <audio controls className="w-full mt-3">
                      <source src={audioPreview} type={audioFile.type} />
                    </audio>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Cover Image (Optional)</Label>
              {!coverImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">Upload cover image</p>
                  <p className="text-sm text-gray-500 mb-4">JPG, PNG, WebP supported</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{coverImage.name}</p>
                        <p className="text-sm text-gray-500">
                          {(coverImage.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={removeCoverImage}
                    >
                      <X className="w-4 h-4 " />
                    </Button>
                  </div>
                  {coverPreview && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/episodes/list">
            <Button className="cursor-pointer" type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button className="cursor-pointer" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Episode
              </>
            )}
          </Button>
        </div>
        {
          isLoading && (
            <>
              <div >
                                   <span className="text-red-500 font-mono">please wait, the image and audio is uploading to server, do not close the page.</span> 
                                    </div>
            </>
          )
        }
      </form>
    </div>
  );
}