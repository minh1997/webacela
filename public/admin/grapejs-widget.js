// GrapesJS Widget for Decap CMS - Simplified Version
(function() {
  'use strict';

  console.log('Loading GrapesJS widget...');

  // Utility function to load external scripts
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        console.log('Loaded:', src);
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load:', src, error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  // Utility function to load stylesheets
  function loadStylesheet(href) {
    return new Promise((resolve) => {
      // Check if stylesheet already exists
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        console.log('Loaded CSS:', href);
        resolve();
      };
      document.head.appendChild(link);
    });
  }

  // GrapesJS Control Component
  const GrapesJSControl = createClass({
    getInitialState() {
      return {
        value: this.props.value || '',
        loaded: false,
        error: null
      };
    },

    async componentDidMount() {
      try {
        console.log('Initializing GrapesJS widget...');
        
        // Load CSS first
        await loadStylesheet('https://unpkg.com/grapesjs@0.20.4/dist/css/grapes.min.css');
        
        // Load core GrapesJS
        if (!window.grapesjs) {
          await loadScript('https://unpkg.com/grapesjs@0.20.4/dist/grapes.min.js');
        }

        // Wait for GrapesJS to be available
        let attempts = 0;
        while (!window.grapesjs && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.grapesjs) {
          throw new Error('GrapesJS failed to load');
        }

        console.log('GrapesJS core loaded successfully');
        this.setState({ loaded: true }, () => {
          setTimeout(() => this.initGrapesJS(), 100);
        });

      } catch (error) {
        console.error('Error loading GrapesJS:', error);
        this.setState({ 
          error: 'Failed to load visual editor: ' + error.message,
          loaded: false 
        });
      }
    },

    initGrapesJS() {
      if (!this.editorRef || !window.grapesjs) {
        console.error('Editor ref or GrapesJS not available');
        return;
      }

      try {
        const { onChange } = this.props;
        const { value } = this.state;

        // Create unique container ID
        const containerId = 'gjs-editor-' + Math.random().toString(36).substr(2, 9);
        this.editorRef.id = containerId;

        console.log('Initializing GrapesJS editor with ID:', containerId);

        // Initialize GrapesJS with minimal configuration
        this.editor = window.grapesjs.init({
          container: `#${containerId}`,
          height: '500px',
          width: 'auto',
          fromElement: false,
          showOffsets: true,
          noticeOnUnload: false,
          storageManager: false,
          
          // Simple block manager
          blockManager: {
            appendTo: '#blocks',
            blocks: [
              {
                id: 'section',
                label: 'Section',
                attributes: { class: 'gjs-block-section' },
                content: `<section>
                  <h1>Insert title here</h1>
                  <p>Insert content here</p>
                </section>`,
              }, {
                id: 'text',
                label: 'Text',
                content: '<div data-gjs-type="text">Insert your text here</div>',
              }, {
                id: 'image',
                label: 'Image',
                select: true,
                content: { type: 'image' },
                activate: true,
              }, {
                id: 'link',
                label: 'Link',
                content: '<a href="#">Link</a>',
              }, {
                id: 'button',
                label: 'Button',
                content: '<button class="btn btn-primary">Click me</button>',
              }
            ]
          },

          // Canvas settings
          canvas: {
            styles: [
              'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
            ]
          },

          // Style manager
          styleManager: {
            appendTo: '#styles-container',
            sectors: [{
              name: 'Dimension',
              open: false,
              buildProps: ['width', 'min-height', 'padding'],
              properties: [
                {
                  property: 'margin',
                  properties: [
                    { name: 'Top', property: 'margin-top'},
                    { name: 'Right', property: 'margin-right'},
                    { name: 'Bottom', property: 'margin-bottom'},
                    { name: 'Left', property: 'margin-left'}
                  ]
                }
              ]
            }, {
              name: 'Typography',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height'],
              properties: [
                { name: 'Font', property: 'font-family' },
                { name: 'Size', property: 'font-size' },
                { name: 'Color', property: 'color' }
              ]
            }]
          },

          // Device Manager
          deviceManager: {
            devices: [{
              name: 'Desktop',
              width: '',
            }, {
              name: 'Mobile',
              width: '320px',
              widthMedia: '480px',
            }]
          },

          // Initial content
          components: value || '<div class="container"><h1>Welcome!</h1><p>Start building your page by dragging components from the right panel.</p></div>',
        });

        // Set up change listener
        this.editor.on('component:add component:remove component:update', () => {
          const html = this.editor.getHtml();
          const css = this.editor.getCss();
          const fullContent = html + (css ? `<style>${css}</style>` : '');
          
          this.setState({ value: fullContent });
          if (onChange) {
            onChange(fullContent);
          }
        });

        console.log('GrapesJS editor initialized successfully');

      } catch (error) {
        console.error('Error initializing GrapesJS editor:', error);
        this.setState({ error: 'Failed to initialize editor: ' + error.message });
      }
    },

    componentWillUnmount() {
      if (this.editor) {
        try {
          this.editor.destroy();
        } catch (e) {
          console.warn('Error destroying editor:', e);
        }
      }
    },

    render() {
      const { loaded, error } = this.state;

      if (error) {
        return h('div', {
          style: {
            padding: '20px',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            backgroundColor: '#ffe0e0',
            color: '#d63031'
          }
        }, [
          h('strong', {}, 'Error: '),
          error,
          h('br'),
          h('button', {
            onClick: () => window.location.reload(),
            style: {
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#d63031',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }
          }, 'Reload Page')
        ]);
      }

      if (!loaded) {
        return h('div', {
          style: {
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
          }
        }, 'Loading visual editor...');
      }

      return h('div', {
        style: {
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden',
          minHeight: '500px'
        }
      }, [
        h('div', {
          ref: ref => { this.editorRef = ref; },
          key: 'editor'
        }),
        h('div', {
          id: 'blocks',
          key: 'blocks',
          style: { display: 'none' }
        }),
        h('div', {
          id: 'styles-container',
          key: 'styles',
          style: { display: 'none' }
        })
      ]);
    }
  });

  // Preview Component
  const GrapesJSPreview = ({ value }) => {
    if (!value) {
      return h('div', {
        style: {
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic'
        }
      }, 'No content to preview');
    }

    return h('div', {
      style: {
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '20px',
        backgroundColor: '#fff',
        overflow: 'auto',
        maxHeight: '400px'
      },
      dangerouslySetInnerHTML: { __html: value }
    });
  };

  // Register the widget
  if (window.CMS) {
    CMS.registerWidget('grapesjs', GrapesJSControl, GrapesJSPreview);
    console.log('GrapesJS widget registered successfully');
  } else {
    console.error('CMS not available for widget registration');
  }

})();
