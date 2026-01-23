import { useState, useCallback, useRef } from 'react';
import type { FeedCategory, ManagedFeed } from '../types';
import { useFeedManager } from '../hooks/useFeedManager';

const FeedManager = () => {
  const {
    feeds,
    categories,
    loading,
    addFeed,
    updateFeed,
    deleteFeed,
    toggleFeedActive,
    addCategory,
    updateCategory,
    deleteCategory,
    exportFeeds,
    importFeeds,
    clearAllData
  } = useFeedManager();

  const [activeTab, setActiveTab] = useState<'feeds' | 'categories'>('feeds');
  const [showAddFeedForm, setShowAddFeedForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<ManagedFeed | null>(null);
  const [editingCategory, setEditingCategory] = useState<FeedCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [feedForm, setFeedForm] = useState({
    url: '',
    title: '',
    description: '',
    categoryId: '',
    refreshInterval: 60
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#2196f3',
    description: ''
  });

  const resetFeedForm = useCallback(() => {
    setFeedForm({
      url: '',
      title: '',
      description: '',
      categoryId: '',
      refreshInterval: 60
    });
    setEditingFeed(null);
    setShowAddFeedForm(false);
  }, []);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({
      name: '',
      color: '#2196f3',
      description: ''
    });
    setEditingCategory(null);
    setShowAddCategoryForm(false);
  }, []);

  const handleFeedSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFeed) {
      updateFeed(editingFeed.id, feedForm);
    } else {
      addFeed({
        ...feedForm,
        isActive: true
      });
    }
    
    resetFeedForm();
  }, [feedForm, editingFeed, updateFeed, addFeed, resetFeedForm]);

  const handleCategorySubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
    } else {
      addCategory(categoryForm);
    }
    
    resetCategoryForm();
  }, [categoryForm, editingCategory, updateCategory, addCategory, resetCategoryForm]);

  const handleEditFeed = useCallback((feed: ManagedFeed) => {
    setEditingFeed(feed);
    setFeedForm({
      url: feed.url,
      title: feed.title,
      description: feed.description || '',
      categoryId: feed.categoryId || '',
      refreshInterval: feed.refreshInterval
    });
    setShowAddFeedForm(true);
  }, []);

  const handleEditCategory = useCallback((category: FeedCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color,
      description: category.description || ''
    });
    setShowAddCategoryForm(true);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFeeds(file)
        .then(() => alert('Feeds imported successfully!'))
        .catch(error => alert('Import failed: ' + error.message));
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importFeeds]);

  const handleExport = useCallback(() => {
    exportFeeds();
  }, [exportFeeds]);

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to delete all feeds and categories? This action cannot be undone.')) {
      clearAllData();
      alert('All data has been cleared.');
    }
  }, [clearAllData]);

  if (loading) {
    return <div>Loading feed manager...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Feed Manager</h2>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('feeds')}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'feeds' ? '2px solid #007bff' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'feeds' ? 'bold' : 'normal'
          }}
        >
          Feeds ({feeds.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '2px solid #007bff' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'categories' ? 'bold' : 'normal'
          }}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Import/Export controls */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📥 Import Feeds
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        
        <button
          onClick={handleExport}
          disabled={feeds.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: feeds.length > 0 ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: feeds.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          📤 Export Feeds
        </button>
        
        <button
          onClick={handleClearAll}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear All Data
        </button>
      </div>

      {activeTab === 'feeds' ? (
        <div>
          {/* Add Feed Button */}
          <button
            onClick={() => setShowAddFeedForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ➕ Add New Feed
          </button>

          {/* Add/Edit Feed Form */}
          {showAddFeedForm && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3>{editingFeed ? 'Edit Feed' : 'Add New Feed'}</h3>
              <form onSubmit={handleFeedSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Feed URL *</label>
                  <input
                    type="url"
                    required
                    value={feedForm.url}
                    onChange={(e) => setFeedForm(prev => ({ ...prev, url: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={feedForm.title}
                    onChange={(e) => setFeedForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                  <textarea
                    value={feedForm.description}
                    onChange={(e) => setFeedForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                  <select
                    value={feedForm.categoryId}
                    onChange={(e) => setFeedForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">No Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Refresh Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={feedForm.refreshInterval}
                    onChange={(e) => setFeedForm(prev => ({ ...prev, refreshInterval: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {editingFeed ? 'Update' : 'Add'} Feed
                  </button>
                  <button
                    type="button"
                    onClick={resetFeedForm}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feeds List */}
          <div>
            {feeds.length === 0 ? (
              <p>No feeds configured. Add your first RSS feed to get started!</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {feeds.map(feed => {
                  const category = categories.find(c => c.id === feed.categoryId);
                  return (
                    <div
                      key={feed.id}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1rem',
                        backgroundColor: feed.isActive ? 'white' : '#f8f9fa'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>
                            {feed.title}
                            {!feed.isActive && <span style={{ color: '#6c757d', marginLeft: '0.5rem' }}>(Inactive)</span>}
                          </h4>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                            {feed.url}
                          </p>
                          {feed.description && (
                            <p style={{ margin: '0 0 0.5rem 0' }}>{feed.description}</p>
                          )}
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                            {category && (
                              <span style={{ 
                                backgroundColor: category.color + '20',
                                color: category.color,
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px'
                              }}>
                                {category.name}
                              </span>
                            )}
                            <span>Refresh: {feed.refreshInterval}min</span>
                            {feed.lastRefreshed && (
                              <span>Last: {new Date(feed.lastRefreshed).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}>
                          <button
                            onClick={() => toggleFeedActive(feed.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: feed.isActive ? '#ffc107' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            {feed.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleEditFeed(feed)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete feed "${feed.title}"?`)) {
                                deleteFeed(feed.id);
                              }
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Add Category Button */}
          <button
            onClick={() => setShowAddCategoryForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ➕ Add New Category
          </button>

          {/* Add/Edit Category Form */}
          {showAddCategoryForm && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <form onSubmit={handleCategorySubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Color</label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                    style={{
                      width: '100px',
                      height: '40px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {editingCategory ? 'Update' : 'Add'} Category
                  </button>
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div>
            {categories.length === 0 ? (
              <p>No categories created yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {categories.map(category => (
                  <div
                    key={category.id}
                    style={{
                      border: `2px solid ${category.color}`,
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: category.color + '10'
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0', color: category.color }}>
                      {category.name}
                    </h4>
                    {category.description && (
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
                        {category.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditCategory(category)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${category.name}"? Feeds in this category will become uncategorized.`)) {
                            deleteCategory(category.id);
                          }
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedManager;
