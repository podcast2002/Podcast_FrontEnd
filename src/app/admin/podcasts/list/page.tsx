'use client';

import { usePodcastStore } from "@/app/store/podcastStore";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function ListPodcast() {
    const {
        podcasts,
        fetchAllPodcasts,
        isLoading,
        error,
        pagination,
        searchQuery,
        currentPage,
        setSearchQuery,
        setCurrentPage,
        deletePodcast
    } = usePodcastStore();

    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedPodcast, setSelectedPodcast] = useState<any | null>(null);

    useEffect(() => {
        fetchAllPodcasts(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(localSearchQuery);
        setCurrentPage(1);
        fetchAllPodcasts(1, localSearchQuery);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchAllPodcasts(page, searchQuery);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPodcast) return;
        const id = selectedPodcast._id;
        setIsDeleting(id);
        try {
            await deletePodcast(id);
            await fetchAllPodcasts(currentPage, searchQuery);

            toast.success(`🎧 "${selectedPodcast.title}" deleted successfully`, {
                description: "Podcast and all its episodes removed.",
            });
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error("Failed to delete podcast", {
                description: "Please try again later.",
            });
        } finally {
            setIsDeleting(null);
            setSelectedPodcast(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading && podcasts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading podcasts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <p className="font-medium">Error loading podcasts</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Podcasts</h1>
                            <p className="mt-2 text-gray-600">
                                Manage your podcast collection
                            </p>
                        </div>
                        <Link
                            href="/admin/podcasts/add"
                            className="mt-4 sm:mt-0  px-4 py-2 flex justify-end  text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <Button className="cursor-pointer">Add New Podcast</Button>
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6 ">
                    <form onSubmit={handleSearch} className="max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search podcasts by title or description..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </form>
                </div>

                {/* Stats */}
                {/* {pagination && (
                    <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                        <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                            <div>
                                Showing {pagination.count} of {pagination.totalPodcasts} podcasts
                            </div>
                            <div>
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Podcasts Grid */}
                {podcasts.length === 0 ? (
                    <div className="text-center py-12">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No podcasts found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first podcast'}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/admin/podcasts/add"
                                className="inline-flex items-center px-4 py-2 text-white font-medium rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <Button className="cursor-pointer">Create First Podcast</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {podcasts.map((podcast) => (
                            <div key={podcast._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                                    {podcast.coverImageUrl ? (
                                        <img
                                            src={podcast.coverImageUrl}
                                            alt={podcast.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {podcast.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-math">
                                        {podcast.description}
                                    </p>

                                    <div className="flex items-center text-xs text-gray-500 mb-4">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {formatDate(podcast.createdAt)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/admin/podcasts/${podcast._id}/episodes`}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            View Episodes
                                        </Link>

                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={`/admin/podcasts/edit/${podcast._id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>

                                            <button
                                                onClick={() => setSelectedPodcast(podcast)}
                                                disabled={isDeleting === podcast._id}
                                                className="p-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors disabled:opacity-50"
                                            >
                                                {isDeleting === podcast._id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    page === 1 ||
                                    page === pagination.totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 cursor-pointer py-2 text-sm font-medium rounded-md ${page === currentPage
                                                ? 'bg-blue-950 text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="px-2 text-gray-500">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            <AlertDialog open={!!selectedPodcast} onOpenChange={() => setSelectedPodcast(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Podcast</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedPodcast?.title}</strong>?  
                            This will also remove all related episodes permanently.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer" disabled={!!isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={!!isDeleting}
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ListPodcast;
