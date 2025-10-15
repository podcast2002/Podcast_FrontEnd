'use client'
import { usePodcastStore } from "@/app/store/podcastStore";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Plus, Search, Edit, Trash2, Calendar, Clock, Play, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import PlayerBar from "@/components/player/PlayerBar";
import { usePlayerStore } from "@/app/store/usePlayerStore";
import { Button } from "@/components/ui/button";

function PodcastEpisodes() {
  const { getPodcastWithEpisodes, podcasts, episodes, isLoading, error, pagination } = usePodcastStore();
  const router = useRouter();
  const params = useParams();
  const podcastId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('releaseDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const podcast = podcasts.find(p => p._id === podcastId);

  useEffect(() => {
    if (podcastId) fetchEpisodes();
  }, [podcastId, currentPage, searchQuery, sortBy, order]);

  const fetchEpisodes = async () => {
    try {
      await getPodcastWithEpisodes(podcastId);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    }
  };

  const handleDelete = async (episodeId: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) return;
    setIsDeleting(episodeId);
    try {
      console.log('Delete episode:', episodeId);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading && episodes.length === 0)
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading episodes...</div>;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
          <p className="font-medium">Error loading episodes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );

  if (!podcast)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-3">Podcast not found</p>
          <Link href="/admin/podcasts/list" className="text-blue-600 hover:underline">
            Return to podcasts list
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24"> 
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        <div className="mb-6">
          <Link
            href="/admin/podcasts/list"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm sm:text-base">Back to Podcasts</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{podcast.title}</h1>
              <p className="mt-1 text-gray-600 text-sm sm:text-base">Manage episodes for this podcast</p>
            </div>
            <Link href={`/admin/episodes/add`}>
              <Button className="flex items-center cursor-pointer w-full sm:w-auto justify-center">
                <Plus className="w-4 h-4 mr-2 cursor-pointer" />
                Add New Episode
              </Button>
            </Link>
          </div>
        </div>

        
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                {podcast.coverImageUrl ? (
                  <img src={podcast.coverImageUrl} alt={podcast.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{podcast.title}</h2>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">{podcast.description}</p>
              <div className="flex items-center justify-center sm:justify-start text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Created {formatDate(podcast.createdAt)}
              </div>
            </div>
          </div>
        </div>

       
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </form>
          {/* <div className="flex items-center justify-between sm:justify-end gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="releaseDate">Release Date</option>
              <option value="title">Title</option>
              <option value="duration">Duration</option>
            </select>
            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="p-2 border rounded-lg text-gray-500 hover:text-blue-600"
            >
              {order === 'asc' ? '↑' : '↓'}
            </button>
          </div> */}
        </div>

        {/* Episodes List */}
        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <Play className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No episodes found</h3>
            <p className="text-gray-600 text-sm mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first episode to get started'}
            </p>
            {!searchQuery && (
              <Link
              href={`/admin/episodes/add`}
                className="inline-flex items-center px-4 py-2  text-white text-sm rounded-lg"
              >
                <Button><Plus className="w-4 h-4 mr-2 cursor-pointer" /> Create First Episode</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((episode) => (
              <div key={episode._id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col">
                  <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {episode.coverImageUrl ? (
                      <img src={episode.coverImageUrl} alt={episode.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{episode.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3">{episode.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{formatDate(episode.releaseDate || '')}</span>
                    {episode.duration && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{episode.duration.toFixed(0)}</span>}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                     onClick={() =>
                        usePlayerStore.getState().setEpisode({
                          _id: episode._id,
                          title: episode.title,
                          audioUrl: episode.audioUrl,
                          coverImageUrl: episode.coverImageUrl || podcast.coverImageUrl,
                          podcastTitle: podcast.title,
                        }, episodes)
                      } 
                      
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Play className="w-4 h-4 cursor-pointer" />
                    </button>
                    <Link  href={`/admin/episodes/edit/${episode._id}`}>
                      <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                    </Link>
                    <button
                      onClick={() => handleDelete(episode._id)}
                      disabled={isDeleting === episode._id}
                      className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {isDeleting === episode._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-md ${page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <PlayerBar />
      </div>
    </div>
  );
}

export default PodcastEpisodes;
