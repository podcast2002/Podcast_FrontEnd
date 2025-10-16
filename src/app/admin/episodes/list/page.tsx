'use client';
import { useEffect, useState } from 'react';
import { useEpisodeStore } from '@/app/store/useEpisodeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Play,
  Calendar,
  Clock,
  MoreVertical,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { usePlayerStore } from '@/app/store/usePlayerStore';
import Link from 'next/link';
import { toast } from 'sonner';
import PlayerBar from "@/components/player/PlayerBar";

export default function ListEpisodes() {
  const {
    episodes,
    isLoading,
    error,
    pagination,
    searchQuery,
    currentPage,
    fetchAllEpisodes,
    deleteEpisode,
    setSearchQuery,
    setCurrentPage
  } = useEpisodeStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchAllEpisodes(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!episodeToDelete) return;

    try {
      await deleteEpisode(episodeToDelete);
      toast.success('Episode deleted successfully');
      setDeleteDialogOpen(false);
      setEpisodeToDelete(null);
    } catch (error) {
      toast.error('Failed to delete episode');
    }
  };

  const openDeleteDialog = (episodeId: string) => {
    setEpisodeToDelete(episodeId);
    setDeleteDialogOpen(true);
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Unknown';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchAllEpisodes(currentPage, searchQuery)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Episodes</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your podcast episodes
          </p>
        </div>
        <Link href="/admin/episodes/add">
          <Button className="w-full sm:w-auto cursor-pointer">
            <Plus className="w-4 h-4 mr-2 " />
            Add Episode
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search episodes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto cursor-pointer">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No episodes found</p>
              <Link href="/admin/episodes/add">
                <Button className="cursor-pointer">Add Your First Episode</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <Card key={episode._id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {episode.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {episode.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">

                        <DropdownMenuItem className="cursor-pointer" asChild>
                          <Link href={`/admin/episodes/edit/${episode._id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer"
                          onClick={() => openDeleteDialog(episode._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Cover Image */}
                    {episode.coverImageUrl && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={episode.coverImageUrl}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Episode Info */}
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(Math.round(Number(episode?.duration ?? 0)))}

                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(episode.releaseDate)}
                      </div>

                      <div className="flex items-end ml-auto">
                        <span className="text-blue-600 font-bold mr-1">Guest :</span> {episode.members || 'not show'}
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          usePlayerStore.getState().setEpisode({
                            _id: episode._id,
                            title: episode.title,
                            audioUrl: episode.audioUrl,
                            coverImageUrl: episode.coverImageUrl,
                            podcastTitle: episode.title,
                          }, episodes)
                        }
                        className="flex-1  cursor-pointer"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/admin/episodes/edit/${episode._id}`}>
                          <Edit className="w-4 h-4 mr-2 cursor-pointer" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
          <PlayerBar />

        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this episode? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 cursor-pointer" >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}