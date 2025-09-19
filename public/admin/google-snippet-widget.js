// Google Search Snippet Preview Widget for Decap CMS
(function() {
  'use strict';

  console.log('Loading Google Search Snippet Preview widget...');

  // Google Search Snippet Preview Control Component
  const GoogleSnippetControl = createClass({
    getInitialState() {
      return {
        siteDomain: window.location.origin.replace(/^https?:\/\//, ''), // Remove protocol
        currentTitle: '',
        currentDescription: '',
        currentSlug: '',
        isPreviewVisible: true
      };
    },

    componentDidMount() {
      this.updatePreviewData();
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
      // Watch for changes in title, description, and slug fields
      this.fieldWatcher = setInterval(() => {
        this.updatePreviewData();
      }, 500); // Check every 500ms for better responsiveness
    },

    updatePreviewData() {
      try {
        // Get title from input field
        const titleInput = document.querySelector('input[type="text"][id*="title"], input[type="text"][name*="title"]');
        const title = titleInput ? titleInput.value : '';

        // Get description from textarea
        const descriptionInput = document.querySelector('textarea[id*="description"], textarea[name*="description"], input[type="text"][id*="description"], input[type="text"][name*="description"]');
        const description = descriptionInput ? descriptionInput.value : '';

        // Get slug from input field
        const slugInput = document.querySelector('input[type="text"][id*="slug"], input[type="text"][name*="slug"]');
        const slug = slugInput ? slugInput.value : '';

        // Only update state if something changed
        if (title !== this.state.currentTitle || 
            description !== this.state.currentDescription || 
            slug !== this.state.currentSlug) {
          
          this.setState({
            currentTitle: title,
            currentDescription: description,
            currentSlug: slug
          });
        }
      } catch (error) {
        console.error('Error updating preview data:', error);
      }
    },

    togglePreview() {
      this.setState({ isPreviewVisible: !this.state.isPreviewVisible });
    },

    getDisplayUrl() {
      const { siteDomain, currentSlug } = this.state;
      const { collection } = this.props;
      
      if (!currentSlug) {
        return `${siteDomain}/...`;
      }

      if (collection && collection.get('name') === 'blog') {
        return `${siteDomain}/blog/${currentSlug}`;
      } else if (collection && collection.get('name') === 'pages') {
        if (currentSlug === 'about' || currentSlug === 'contact') {
          return `${siteDomain}/${currentSlug}`;
        }
        return `${siteDomain}/${currentSlug}`;
      } else if (collection && collection.get('name') === 'landing') {
        return `${siteDomain}/${currentSlug}`;
      }
      
      return `${siteDomain}/${currentSlug}`;
    },

    getDisplayTitle() {
      const { currentTitle } = this.state;
      if (!currentTitle) {
        return 'Page Title - Your Site Name';
      }
      
      // Truncate title if too long (Google typically shows ~60 characters)
      const maxLength = 60;
      if (currentTitle.length > maxLength) {
        return currentTitle.substring(0, maxLength - 3) + '...';
      }
      
      return `${currentTitle}`;
    },

    getDisplayDescription() {
      const { currentDescription } = this.state;
      if (!currentDescription) {
        return 'Add a description to see how your page will appear in Google search results. This meta description should be compelling and under 160 characters.';
      }
      
      // Truncate description if too long (Google typically shows ~160 characters)
      const maxLength = 160;
      if (currentDescription.length > maxLength) {
        return currentDescription.substring(0, maxLength - 3) + '...';
      }
      
      return currentDescription;
    },

    render() {
      const { isPreviewVisible } = this.state;
      const { classNameWrapper } = this.props;

      const displayUrl = this.getDisplayUrl();
      const displayTitle = this.getDisplayTitle();
      const displayDescription = this.getDisplayDescription();

      return h('div', {
        className: classNameWrapper,
        style: {
          border: '1px solid #34a853',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          marginBottom: '15px'
        }
      }, [
        // Header with toggle
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            cursor: 'pointer'
          },
          onClick: this.togglePreview
        }, [
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#34a853'
            }
          }, [
            h('span', { style: { marginRight: '8px' } }, '🔍'),
            'Google Search Preview'
          ]),
          h('button', {
            type: 'button',
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '14px',
              color: '#666',
              cursor: 'pointer'
            }
          }, isPreviewVisible ? '▼' : '▶')
        ]),

        // Search snippet preview
        isPreviewVisible && h('div', {
          style: {
            backgroundColor: 'white',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'arial, sans-serif'
          }
        }, [
          // URL
          h('div', {
            style: {
              fontSize: '14px',
              color: '#202124',
              marginBottom: '2px',
              lineHeight: '1.3'
            }
          }, [
            h('span', {
              style: {
                color: '#5f6368'
              }
            }, displayUrl.split('/')[0]), // Domain part
            displayUrl.includes('/') && h('span', {
              style: {
                color: '#202124'
              }
            }, displayUrl.substring(displayUrl.indexOf('/'))) // Path part
          ]),

          // Title (clickable link)
          h('div', {
            style: {
              lineHeight: '1.3',
              marginBottom: '3px'
            }
          }, [
            h('h2', {
              style: {
                color: '#1A0DAB',
                fontSize: '20px',
                marginBottom: '0',
              },
            }, displayTitle)
          ]),

          // Description
          h('div', {
            style: {
              fontSize: '14px',
              color: '#4d5156',
              lineHeight: '1.58',
              marginTop: '4px'
            }
          }, displayDescription),

          // Additional info for development
          h('div', {
            style: {
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#f1f3f4',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#5f6368'
            }
          }, [
            h('div', { style: { marginBottom: '4px' } }, [
              h('strong', {}, 'Title: '),
              `${this.state.currentTitle.length}/60 characters`,
              this.state.currentTitle.length > 60 && h('span', { 
                style: { color: '#ea4335', marginLeft: '4px' } 
              }, '⚠️ Too long')
            ]),
            h('div', {}, [
              h('strong', {}, 'Description: '),
              `${this.state.currentDescription.length}/160 characters`,
              this.state.currentDescription.length > 160 && h('span', { 
                style: { color: '#ea4335', marginLeft: '4px' } 
              }, '⚠️ Too long'),
              this.state.currentDescription.length < 120 && this.state.currentDescription.length > 0 && h('span', { 
                style: { color: '#fbbc04', marginLeft: '4px' } 
              }, '⚠️ Could be longer')
            ])
          ])
        ]),

        // Help text
        !isPreviewVisible && h('div', {
          style: {
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic'
          }
        }, 'Click to expand and see how your page will appear in Google search results')
      ]);
    }
  });

  // Simple Preview Component (for the widget list)
  const GoogleSnippetPreview = ({ value, entry, collection }) => {
    return h('div', {
      style: {
        padding: '10px',
        border: '1px solid #34a853',
        borderRadius: '4px',
        backgroundColor: '#e8f5e8',
        textAlign: 'center'
      }
    }, [
      h('span', { style: { marginRight: '5px' } }, '🔍'),
      'Google Search Preview',
      h('br'),
      h('small', {
        style: { color: '#666', fontSize: '11px' }
      }, 'See how your page appears in search results')
    ]);
  };

  // Register the widget
  if (window.CMS) {
    CMS.registerWidget('google-snippet-preview', GoogleSnippetControl, GoogleSnippetPreview);
    console.log('Google Search Snippet Preview widget registered successfully');
  } else {
    console.error('CMS not available for widget registration');
  }

})();