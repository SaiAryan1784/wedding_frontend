import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "../../Footer";
import { FiPlus, FiTrash2, FiEdit, FiSearch, FiBarChart, FiUsers, FiSettings, FiHome, FiFolder, FiCalendar, FiEye, FiShare2, FiChevronLeft, FiChevronRight, FiTag, FiFilter } from 'react-icons/fi';
import { useGetTotalViewCountQuery, useGetBlogCountQuery, useGetBlogsQuery, useDeleteBlogMutation } from '../../../redux/blogSlice';

function BlogDashboard() {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date().toISOString());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // New state for tags management
  const [selectedTag, setSelectedTag] = useState('');
  const [tagsList, setTagsList] = useState([]);
  const [showTagsSection, setShowTagsSection] = useState(false);

  // Calculate skip value for backend pagination
  const skip = (currentPage - 1) * itemsPerPage;
  
  // Fetch blog and view counts using the hooks
  const { data: blogCountData, error: blogCountError, isLoading: blogCountLoading } = useGetBlogCountQuery();
  const { data: viewCountData, error: viewCountError, isLoading: viewCountLoading } = useGetTotalViewCountQuery();
  
  // Use paginated query for blogs
  const { 
    data: allBlogsData, 
    error: allBlogsError, 
    isLoading: allBlogsLoading,
    refetch: refetchBlogs
  } = useGetBlogsQuery({
    s: skip,
    t: itemsPerPage,
    // Add status filter if not "All"
    ...(statusFilter !== 'All' && { status: statusFilter.toUpperCase() }),
    // Add tag filter if selected
    ...(selectedTag && { tag: selectedTag })
  });
  
  const [deleteBlog, { isLoading: deleting, error: deleteError }] = useDeleteBlogMutation();

  // Update the datetime every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setCurrentDateTime(formattedDate);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sample blog post data
  const [blogPosts, setBlogPosts] = useState([]);

  // Update total items count when data changes
  useEffect(() => {
    if (allBlogsData && allBlogsData.success) {
      setTotalItems(allBlogsData.totalCount || 0);
      setBlogPosts(allBlogsData.data.map(blog => ({
        id: blog.id,
        title: blog.title,
        urlTitle: blog.urlTitle,
        content: blog.content || '',
        status: blog.status?.toLowerCase() || 'published',
        date: new Date(blog.createdAt).toISOString().split('T')[0],
        views: blog.viewCount || 0,
        comments: blog._count?.comments || 0,
        likes: blog._count?.likedBy || 0,
        author: 'admin' // Replace with actual user
      })));
      
      // Extract and deduplicate tags
      const allTags = allBlogsData.data.reduce((tags, blog) => {
        if (blog.tags && blog.tags.length) {
          blog.tags.forEach(tag => {
            if (!tags.some(t => t.id === tag.id)) {
              tags.push(tag);
            }
          });
        }
        return tags;
      }, []);
      
      setTagsList(allTags);
    }
  }, [allBlogsData]);

  // Refetch blogs when filters change
  useEffect(() => {
    refetchBlogs();
  }, [statusFilter, selectedTag, currentPage, refetchBlogs]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    status: 'draft'
  });

  // Function to handle "Add Blog" button click
  const handleAddBlog = () => {
    navigate('/new-blog-post');
  };

  const handleDeleteClick = (id) => {
    setDeletingPostId(id);
    setShowDeleteModal(true);
  };

  const handleEditClick = (post) => {
    navigate(`/update-blog-post/${post.urlTitle}`);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBlog(deletingPostId).unwrap();
      // Refetch blogs after deletion
      refetchBlogs();
      setShowDeleteModal(false);
      setDeletingPostId(null);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Error deleting blog post.');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    // This would need to be implemented with a proper API call
    setBlogPosts(blogPosts.map(post =>
      post.id === id ? { ...post, status: newStatus } : post
    ));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleShareClick = (post) => {
    const shareUrl = `${window.location.origin}/blogs/${post.urlTitle}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Blog URL copied to clipboard!');
  };

  const handleViewBlog = (post) => {

    window.open(`/blogs/${post.urlTitle}`, '_blank'); // Navigate to the blog post
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleTagClick = (tagName) => {
    setSelectedTag(tagName === selectedTag ? '' : tagName);
    setCurrentPage(1); // Reset to first page on tag filter change
  };

  const handleResetFilters = () => {
    setSelectedTag('');
    setStatusFilter('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Advanced pagination with page numbers
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to generate pagination range
  const getPaginationRange = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: (endPage - startPage + 1)}, (_, i) => startPage + i);
  };

  // Admin dashboard stats
  const totalPosts = blogCountData?.all || 0;
  const totalViews = viewCountData?.totalViews || 0;
  const publishedPosts = blogCountData?.published || 0;
  const draftPosts = blogCountData?.draft || 0;

  const EnhancedPagination = () => {
    const pageNumbers = getPaginationRange();
  
    return (
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-gray-600">
          Showing {skip + 1} to {Math.min(skip + itemsPerPage, totalItems)} of {totalItems} entries
        </div>
        <nav className="flex items-center">
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`mr-2 p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <FiChevronLeft size={16} />
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`mx-1 px-4 py-2 rounded-md ${currentPage === number 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-2 p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <FiChevronRight size={16} />
          </button>
        </nav>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded p-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={7}>7</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
    );
  };

  const TagsSection = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Tags</h3>
          <button 
            onClick={() => setShowTagsSection(!showTagsSection)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {showTagsSection ? 'Hide Tags' : 'Show Tags'}
          </button>
        </div>
        
        {showTagsSection && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {tagsList.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.tagName)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag.tagName
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <FiTag className="mr-1" />
                  {tag.tagName}
                </button>
              ))}
              
              {tagsList.length === 0 && (
                <p className="text-gray-500 text-sm">No tags found</p>
              )}
            </div>
            
            {selectedTag && (
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600 mr-2">Active filter:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-600 text-white">
                  <FiTag className="mr-1" />
                  {selectedTag}
                  <button
                    onClick={() => setSelectedTag('')}
                    className="ml-1 hover:text-gray-100"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="px-4">
              <button
                onClick={handleAddBlog}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-2" />
                New Post
              </button>
              <hr className="my-4" />
            </div>
            <nav className="mt-5 px-4 flex-1 space-y-1">
              <div
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiHome className="mr-3 h-5 w-5" />
                Dashboard
              </div>
              <div
                onClick={() => setActiveTab('posts')}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${activeTab === 'posts' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiFolder className="mr-3 h-5 w-5" />
                Posts
              </div>
              <div
                onClick={() => {
                  setActiveTab('tags');
                  setShowTagsSection(true);
                }}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${activeTab === 'tags' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiTag className="mr-3 h-5 w-5" />
                Tags
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 h-[90vh]">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm uppercase text-gray-500 font-medium">Total Posts</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {blogCountLoading ? 'Loading...' : totalPosts}
                  </p>
                  <div className="flex items-center mt-4">
                    <FiFolder className="text-indigo-500" />
                    <span className="text-sm text-gray-600 ml-2">All blog posts</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm uppercase text-gray-500 font-medium">Published</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{publishedPosts}</p>
                  <div className="flex items-center mt-4">
                    <FiCalendar className="text-green-500" />
                    <span className="text-sm text-gray-600 ml-2">Live posts</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm uppercase text-gray-500 font-medium">Drafts</h3>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{draftPosts}</p>
                  <div className="flex items-center mt-4">
                    <FiEdit className="text-amber-500" />
                    <span className="text-sm text-gray-600 ml-2">Unpublished posts</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm uppercase text-gray-500 font-medium">Total Views</h3>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {viewCountLoading ? 'Loading...' : totalViews}
                  </p>
                  <div className="flex items-center mt-4">
                    <FiEye className="text-indigo-500" />
                    <span className="text-sm text-gray-600 ml-2">Total views across all posts</span>
                  </div>
                </div>
              </div>

              {/* Recent Posts */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Posts</h3>
                <div className="space-y-4">
                  {allBlogsLoading ? (
                    <p className="text-center py-4">Loading posts...</p>
                  ) : blogPosts.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No posts found</p>
                  ) : (
                    blogPosts.slice(0, 5).map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 
                            onClick={() => handleViewBlog(post)} 
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
                          >
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-600">{post.status}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleEditClick(post)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(post.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                          {/* Share Button */}
                          <button
                            onClick={() => handleShareClick(post)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiShare2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-8">
              {/* Tags filter section */}
              <TagsSection />
              
              {/* Filters, Sorting, and Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                  
                  {(selectedTag || statusFilter !== 'All' || searchTerm) && (
                    <button
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                    >
                      <FiFilter className="mr-1" />
                      Reset Filters
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <FiCalendar className="mr-1" />
                    Sort by Date
                  </button>
                  <button
                    onClick={() => handleSort('views')}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <FiEye className="mr-1" />
                    Sort by Views
                  </button>
                </div>
              </div>

              {/* Posts Table */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {allBlogsLoading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-500">Loading posts...</p>
                  </div>
                ) : blogPosts.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-lg text-gray-500">No posts found</p>
                    <button
                      onClick={handleAddBlog}
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 
                            onClick={() => handleViewBlog(post)}
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
                          >
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-600">{post.status}</p>
                          <p className="text-sm text-gray-600">Views: {post.views} • Comments: {post.comments || 0}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleEditClick(post)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(post.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleShareClick(post)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiShare2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Pagination */}
              {!allBlogsLoading && blogPosts.length > 0 && (
                <EnhancedPagination />
              )}
            </div>
          )}
          
          {activeTab === 'tags' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Tags</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">All Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.length > 0 ? (
                      tagsList.map(tag => (
                        <div 
                          key={tag.id} 
                          className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm"
                        >
                          <FiTag className="mr-2 text-indigo-500" />
                          <span>{tag.tagName}</span>
                          <button 
                            onClick={() => handleTagClick(tag.tagName)}
                            className="ml-2 hover:text-indigo-600"
                          >
                            View Posts
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No tags found. Tags will appear when you add them to blog posts.</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Tag Usage</h3>
                  <div className="max-h-96 overflow-y-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tag
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usage Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tagsList.map(tag => {
                          // Count how many blogs use this tag
                          const usageCount = allBlogsData?.data?.filter(blog => 
                            blog.tags.some(t => t.id === tag.id)
                          ).length || 0;
                          
                          return (
                            <tr key={tag.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FiTag className="mr-2 text-indigo-500" />
                                  <div className="text-sm font-medium text-gray-900">
                                    {tag.tagName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {usageCount} {usageCount === 1 ? 'post' : 'posts'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => {
                                    setSelectedTag(tag.tagName);
                                    setActiveTab('posts');
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  View Posts
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        
                        {tagsList.length === 0 && (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                              No tags available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className={`bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md ${deleting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogDashboard;