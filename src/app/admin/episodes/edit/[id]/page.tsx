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
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditEpisode() {
  const { 
    selectedEpisode, 
    getEpisodeById, 
    updateEpisode, 
    isLoading 
  } = useEpisodeStore();
  const { podcasts, fetchAllPodcasts } = usePodcastStore();
  const router = useRouter();
  const params = useParams();
  const episodeId = params.id as string;

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
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllPodcasts(),
          getEpisodeById(episodeId)
        ]);
      } catch (error) {
        toast.error('Failed to load episode data');
        router.push('/admin/episodes/list');
      } finally {
        setIsLoadingEpisode(false);
      }
    };

    if (episodeId) {
      loadData();
    }
  }, [episodeId]);

  useEffect(() => {
    if (selectedEpisode) {
      setFormData({
        title: selectedEpisode.title || '',
        members: selectedEpisode.members || '',
        description: selectedEpisode.description || '',
        podcastId: selectedEpisode.podcastId || '',
        releaseDate: selectedEpisode.releaseDate ? selectedEpisode.releaseDate.split('T')[0] : '',
        duration: selectedEpisode.duration?.toString() || '',
      });
      
      if (selectedEpisode.coverImageUrl) {
        setCoverPreview(selectedEpisode.coverImageUrl);
      }
    }
  }, [selectedEpisode]);

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
    if (audioPreview && audioPreview.startsWith('blob:')) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    if (coverPreview && coverPreview.startsWith('blob:')) {
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
      toast.error('members is required');
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
      
      if (audioFile) {
        data.append('audio', audioFile);
      }
      
      if (coverImage) {
        data.append('coverImage', coverImage);
      }

      await updateEpisode(episodeId, data);
      toast.success('Episode updated successfully');
      router.push('/admin/episodes/list');
    } catch (error) {
      toast.error('Failed to update episode');
    }
  };

  if (isLoadingEpisode) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedEpisode) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Episode not found</p>
              <Link href="/admin/episodes/list">
                <Button>Back to Episodes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/episodes/list">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-mono text-gray-900">Edit Episode</h1>
         
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
       
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

       
        <Card>
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio File */}
            <div className="space-y-4">
              <Label>Audio File</Label>
              {!audioFile && !selectedEpisode.audioUrl ? (
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
                        <p className="font-medium">
                          {audioFile ? audioFile.name : 'Current audio file'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Existing file'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileChange}
                        className="hidden"
                        id="audio-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                      >
                        Replace
                      </Button>
                      {audioFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={removeAudioFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {(audioPreview || selectedEpisode.audioUrl) && (
                    <audio controls className="w-full mt-3">
                      <source src={audioPreview || selectedEpisode.audioUrl} type="audio/mpeg" />
                    </audio>
                  )}
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <Label>Cover Image</Label>
              {!coverImage && !selectedEpisode.coverImageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2 cursor-pointer">Upload cover image</p>
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
                        <p className="font-medium">
                          {coverImage ? coverImage.name : 'Current cover image'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {coverImage ? `${(coverImage.size / (1024 * 1024)).toFixed(2)} MB` : 'Existing image'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => document.getElementById('cover-upload')?.click()}
                      >
                        Replace
                      </Button>
                      {coverImage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={removeCoverImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {(coverPreview || selectedEpisode.coverImageUrl) && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={coverPreview || selectedEpisode.coverImageUrl}
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
                Updating...
              </>
            ) : (
              <>
                <Save  className="w-4 h-4 mr-2 cursor-pointer" />
                Update Episode
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
