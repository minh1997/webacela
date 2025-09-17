// Live Page Opener Widget for Decap CMS
(function() {
  'use strict';

  console.log('Loading Live Page Opener widget...');

  // Live Page Opener Control Component
  const LivePageOpenerControl = createClass({
    getInitialState() {
      return {
        currentPageUrl: null,
        siteDomain: window.location.origin, // Get current domain
        isLoading: false,
        currentSlug: null
      };
    },

    componentDidMount() {
      this.detectCurrentPageUrl();
      // Watch for field changes
      this.watchForFieldChanges();
    },

    componentWillUnmount() {
      // Clean up any event listeners
      if (this.fieldWatcher) {
        clearInterval(this.fieldWatcher);
      }
    },

    watchForFieldChanges() {
      // Watch for changes in the slug field specifically
      this.fieldWatcher = setInterval(() => {
        try {
          // Try to get the slug from the actual input field in the DOM
          const slugInput = document.querySelector('input[type="text"][id*="slug"], input[type="text"][placeholder*="slug"], input[type="text"][name*="slug"]');
          if (slugInput && slugInput.value) {
            const newSlug = slugInput.value;
            if (newSlug !== this.state.currentSlug) {
              console.log('Slug changed from', this.state.currentSlug, 'to', newSlug);
              this.setState({ currentSlug: newSlug }, () => {
                this.updateUrlFromSlug(newSlug);
              });
            }
          }
        } catch (error) {
          console.error('Error watching for field changes:', error);
        }
      }, 500); // Check every 500ms for better responsiveness
    },

    updateUrlFromSlug(slug) {
      try {
        const { collection } = this.props;
        const siteDomain = this.state.siteDomain;
        let pageUrl = null;

        if (!collection || !slug) {
          return;
        }

        // Handle different collection types
        if (collection.get('name') === 'pages') {
          if (slug === 'about') {
            pageUrl = `${siteDomain}/about`;
          } else if (slug === 'contact') {
            pageUrl = `${siteDomain}/contact`;
          } else {
            pageUrl = `${siteDomain}/${slug}`;
          }
        } else if (collection.get('name') === 'blog') {
          pageUrl = `${siteDomain}/blog/${slug}`;
        } else if (collection.get('name') === 'landing') {
          pageUrl = `${siteDomain}/${slug}`;
        }

        this.setState({ currentPageUrl: pageUrl });
      } catch (error) {
        console.error('Error updating URL from slug:', error);
      }
    },

    detectCurrentPageUrl() {
      try {
        // Get the current entry from CMS context
        const { entry, collection } = this.props;
        
        if (!entry || !collection) {
          console.log('No entry or collection found');
          return;
        }

        let pageUrl = null;
        let initialSlug = null;
        const siteDomain = this.state.siteDomain;

        // Handle different collection types
        if (collection.get('name') === 'pages') {
          const entryName = entry.get('slug') || entry.get('name');
          initialSlug = entryName;
          
          if (entryName === 'about') {
            pageUrl = `${siteDomain}/about`;
          } else if (entryName === 'contact') {
            pageUrl = `${siteDomain}/contact`;
          } else {
            pageUrl = `${siteDomain}/${entryName}`;
          }
        } else if (collection.get('name') === 'blog') {
          const slug = entry.get('slug');
          initialSlug = slug;
          if (slug) {
            pageUrl = `${siteDomain}/blog/${slug}`;
          }
        } else if (collection.get('name') === 'landing') {
          const slug = entry.get('slug') || entry.getIn(['data', 'slug']);
          initialSlug = slug;
          if (slug) {
            pageUrl = `${siteDomain}/${slug}`;
          }
        }
        
        this.setState({ 
          currentPageUrl: pageUrl,
          currentSlug: initialSlug
        });
      } catch (error) {
        console.error('Error detecting page URL:', error);
      }
    },

    handleOpenLivePage() {
      const { currentPageUrl } = this.state;
      if (currentPageUrl) {
        this.setState({ isLoading: true });
        
        // Open the live page
        window.open(currentPageUrl, '_blank', 'noopener,noreferrer');
        
        // Reset loading state after a short delay
        setTimeout(() => {
          this.setState({ isLoading: false });
        }, 1000);
      }
    },

    handlePreviewInFrame() {
      const { currentPageUrl } = this.state;
      if (currentPageUrl) {
        // Create a preview popup with iframe
        const previewWindow = window.open('', 'live-preview', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        if (previewWindow) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Live Page Preview - ${currentPageUrl}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 0; 
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                  }
                  .preview-header {
                    background: #007bff;
                    color: white;
                    padding: 10px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .preview-url {
                    font-size: 14px;
                    background: rgba(255,255,255,0.2);
                    padding: 5px 10px;
                    border-radius: 15px;
                    flex: 1;
                    margin: 0 20px;
                    text-align: center;
                  }
                  .preview-actions {
                    display: flex;
                    gap: 10px;
                  }
                  .btn {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                  }
                  .btn-light { background: white; color: #007bff; }
                  .btn-danger { background: #dc3545; color: white; }
                  iframe {
                    width: 100%;
                    height: calc(100vh - 60px);
                    border: none;
                    background: white;
                  }
                </style>
              </head>
              <body>
                <div class="preview-header">
                  <strong>🔴 LIVE PAGE PREVIEW</strong>
                  <div class="preview-url">${currentPageUrl}</div>
                  <div class="preview-actions">
                    <a href="${currentPageUrl}" target="_blank" class="btn btn-light">
                      🔗 Open in New Tab
                    </a>
                    <button onclick="window.close()" class="btn btn-danger">
                      ✕ Close
                    </button>
                  </div>
                </div>
                <iframe src="${currentPageUrl}" title="Live Page Preview"></iframe>
              </body>
            </html>
          `);
          previewWindow.document.close();
        }
      }
    },

    render() {
      const { currentPageUrl, isLoading, siteDomain } = this.state;
      const { classNameWrapper } = this.props;

      return h('div', {
        className: classNameWrapper,
        style: {
          border: '1px solid #007bff',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          marginBottom: '15px'
        }
      }, [
        // Header
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#007bff'
          }
        }, [
          h('span', { style: { marginRight: '8px' } }, '🌐'),
          'Live Page Actions'
        ]),

        // Current page info
        h('div', {
          style: {
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }
        }, [
          h('div', {
            style: {
              fontSize: '12px',
              color: '#6c757d',
              marginBottom: '5px'
            }
          }, 'Current Page URL:'),
          h('div', {
            style: {
              fontSize: '14px',
              fontFamily: 'monospace',
              color: currentPageUrl ? '#28a745' : '#dc3545',
              wordBreak: 'break-all'
            }
          }, currentPageUrl || 'Unable to detect page URL'),
          h('div', {
            style: {
              fontSize: '11px',
              color: '#6c757d',
              marginTop: '5px'
            }
          }, `Site: ${siteDomain}`)
        ]),

        // Action buttons
        h('div', {
          style: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }
        }, [
          // Open Live Page Button
          h('button', {
            type: 'button',
            onClick: this.handleOpenLivePage,
            disabled: !currentPageUrl || isLoading,
            style: {
              padding: '10px 16px',
              backgroundColor: currentPageUrl && !isLoading ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPageUrl && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: currentPageUrl && !isLoading ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            h('span', {}, isLoading ? '⏳' : '�'),
            isLoading ? 'Opening...' : 'Open Live Page'
          ]),

          // Preview in Frame Button
          h('button', {
            type: 'button',
            onClick: this.handlePreviewInFrame,
            disabled: !currentPageUrl,
            style: {
              padding: '10px 16px',
              backgroundColor: currentPageUrl ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPageUrl ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: currentPageUrl ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            h('span', {}, '�️'),
            'Preview in Frame'
          ]),

          // Copy URL Button
          h('button', {
            type: 'button',
            onClick: () => {
              if (currentPageUrl && navigator.clipboard) {
                navigator.clipboard.writeText(currentPageUrl).then(() => {
                  alert('Live page URL copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy URL');
                });
              }
            },
            disabled: !currentPageUrl,
            style: {
              padding: '10px 16px',
              backgroundColor: currentPageUrl ? '#17a2b8' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPageUrl ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: currentPageUrl ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            h('span', {}, '📋'),
            'Copy URL'
          ])
        ]),

        // Help text
        h('div', {
          style: {
            marginTop: '12px',
            fontSize: '11px',
            color: '#6c757d',
            fontStyle: 'italic'
          }
        }, '💡 This widget automatically detects your current page and provides quick access to view the live version.')
      ]);
    }
  });

  // Simple Preview Component
  const LivePageOpenerPreview = ({ value, entry, collection }) => {
    return h('div', {
      style: {
        padding: '10px',
        border: '1px solid #007bff',
        borderRadius: '4px',
        backgroundColor: '#e3f2fd',
        textAlign: 'center'
      }
    }, [
      h('span', { style: { marginRight: '5px' } }, '🌐'),
      'Live Page Opener Widget',
      h('br'),
      h('small', {
        style: { color: '#666', fontSize: '11px' }
      }, 'Click to access live page actions')
    ]);
  };

  // Register the widget
  if (window.CMS) {
    CMS.registerWidget('live-page-opener', LivePageOpenerControl, LivePageOpenerPreview);
    console.log('Live Page Opener widget registered successfully');
  } else {
    console.error('CMS not available for widget registration');
  }

})();
