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
        
        // Load CSS first
        await loadStylesheet('https://unpkg.com/grapesjs@0.20.4/dist/css/grapes.min.css');
        
        // Load core GrapesJS
        if (!window.grapesjs) {
          await loadScript('https://unpkg.com/grapesjs@0.20.4/dist/grapes.min.js');
        }
        
        // Load blocks-basic plugin from correct CDN
        await loadScript('https://unpkg.com/grapesjs-blocks-basic@1.0.2/dist/index.js');
        
        // Load TUI Image Editor plugin from CDN
        await loadScript('https://unpkg.com/grapesjs-tui-image-editor@1.0.2/dist/index.js');
        
        // Load GrapesJS Forms plugin from CDN
        await loadScript('https://unpkg.com/grapesjs-plugin-forms@2.0.6/dist/index.js');
        
        // Load GrapesJS Preset Webpage plugin from CDN
        await loadScript('https://unpkg.com/grapesjs-preset-webpage@1.0.3/dist/index.js');

        // Wait for GrapesJS to be available
        let attempts = 0;
        while (!window.grapesjs && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.grapesjs) {
          throw new Error('GrapesJS failed to load');
        }

        this.setState({ loaded: true }, () => {
          setTimeout(() => this.initGrapesJS(), 100);
        });

      } catch (error) {
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

        // Try to find the correct plugin names
        const possibleBasicNames = ['gjs-blocks-basic', 'grapesjs-blocks-basic', 'blocks-basic'];
        const possibleTuiNames = ['grapesjs-tui-image-editor', 'tui-image-editor'];
        const possibleFormsNames = ['grapesjs-plugin-forms', 'plugin-forms', 'forms'];
        const possiblePresetNames = ['grapesjs-preset-webpage', 'preset-webpage', 'webpage'];
        
        let basicPluginName = null;
        let tuiPluginName = null;
        let formsPluginName = null;
        let presetPluginName = null;
        
        for (const name of possibleBasicNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            basicPluginName = name;
            break;
          }
        }
        
        for (const name of possibleTuiNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            tuiPluginName = name;
            break;
          }
        }
        
        for (const name of possibleFormsNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            formsPluginName = name;
            break;
          }
        }
        
        for (const name of possiblePresetNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            presetPluginName = name;
            break;
          }
        }

        if (!basicPluginName) {
          basicPluginName = 'gjs-blocks-basic'; // Default attempt
        }
        
        if (!tuiPluginName) {
          tuiPluginName = 'grapesjs-tui-image-editor'; // Default attempt
        }
        
        if (!formsPluginName) {
          formsPluginName = 'grapesjs-plugin-forms'; // Default attempt
        }
        
        if (!presetPluginName) {
          presetPluginName = 'grapesjs-preset-webpage'; // Default attempt
        }

        // Initialize GrapesJS with all four plugins
        try {
          this.editor = window.grapesjs.init({
            container: `#${containerId}`,
            height: '800px',
            width: 'auto',
            fromElement: false,
            showOffsets: true,
            noticeOnUnload: false,
            storageManager: false,
            
            // Load all four plugins
            plugins: [basicPluginName, tuiPluginName, formsPluginName, presetPluginName],
            
            // Plugin options
            pluginOpts: {
              [basicPluginName]: {
                blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
                category: {
                  id: 'basic',
                  label: 'Basic',
                  open: true
                }
              },
              [tuiPluginName]: {
                config: {
                  includeUI: {
                    initMenu: 'filter',
                    menuBarPosition: 'bottom'
                  },
                  cssMaxWidth: 700,
                  cssMaxHeight: 500
                },
                onApply: (imageEditor, imageModel) => {
                  console.log('Image edited:', imageModel);
                }
              },
              [formsPluginName]: {
                blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
                category: 'Forms'
              },
              [presetPluginName]: {
                blocks: ['link-block', 'quote', 'text-basic'],
                modalImportTitle: 'Import Code',
                modalImportButton: 'Import',
                modalImportLabel: 'Paste your HTML/CSS code here',
                textCleanCanvas: 'Are you sure to clean the canvas?',
                showStylesOnChange: true,
                useCustomTheme: true
              }
            },
            
            // Canvas settings
            canvas: {
              styles: [
                'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
              ],
              scripts: [
                'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
              ]
            },

            // Device Manager
            deviceManager: {
              devices: [{
                name: 'Desktop',
                width: '',
              }, 
              {
                name: 'Tablet',
                width: '768px',
                widthMedia: '992px',
              },
              {
                name: 'Mobile',
                width: '320px',
                widthMedia: '480px',
              }]
            },

            // Initial content
            components: value || '<div class="container"><h1>Welcome!</h1><p>Start building your page by dragging components from the right panel.</p></div>',
          });
          
          console.log('GrapesJS editor with plugin initialized successfully');
          
          // Fix device commands to work with existing toolbar
          this.fixDeviceCommands();
          
        } catch (pluginError) {
          console.warn('Plugin failed, initializing without plugin:', pluginError);
          
          // Fallback: Initialize without plugin
          this.editor = window.grapesjs.init({
            container: `#${containerId}`,
            height: '800px',
            width: 'auto',
            
            // Canvas settings
            canvas: {
              styles: [
                'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
              ],
              scripts: [
                'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
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
          
          console.log('GrapesJS editor initialized without plugin (fallback)');
        }

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

        // Ensure Tailwind CSS is loaded in iframe
        this.ensureTailwindLoaded();

        console.log('GrapesJS editor initialized successfully');

      } catch (error) {
        console.error('Error initializing GrapesJS editor:', error);
        this.setState({ error: 'Failed to initialize editor: ' + error.message });
      }
    },

    ensureTailwindLoaded() {
      if (!this.editor) return;

      // Wait a bit for the iframe to be fully initialized
      setTimeout(() => {
        try {
          const iframe = this.editor.Canvas.getFrameEl();
          if (iframe && iframe.contentDocument) {
            const doc = iframe.contentDocument;
            
            // Check if Tailwind script is already loaded
            const existingTailwind = doc.querySelector('script[src*="tailwindcss"]');
            if (!existingTailwind) {
              console.log('Injecting Tailwind CSS script into iframe...');
              
              // Create script element for Tailwind CSS Play CDN
              const tailwindScript = doc.createElement('script');
              tailwindScript.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';
              
              // Add to iframe head
              if (doc.head) {
                doc.head.appendChild(tailwindScript);
                console.log('Tailwind CSS script injected successfully');
              }
            }
          }
        } catch (error) {
          console.error('Error injecting Tailwind CSS script:', error);
        }
      }, 1000);
    },

    fixDeviceCommands() {
      if (!this.editor) return;

      // Get device manager and commands
      const deviceManager = this.editor.DeviceManager;
      const commands = this.editor.Commands;
      
      console.log('Fixing device commands...');

      // Override/fix the existing device commands to work properly
      commands.add('set-device-desktop', {
        run: (editor) => {
          const device = deviceManager.get('desktop') || deviceManager.getAll().find(d => d.get('name') === 'Desktop');
          if (device) {
            deviceManager.select(device);
            console.log('Switched to desktop view');
          } else {
            console.warn('Desktop device not found');
          }
        }
      });

      commands.add('set-device-tablet', {
        run: (editor) => {
          const device = deviceManager.get('tablet') || deviceManager.getAll().find(d => d.get('name') === 'Tablet');
          if (device) {
            deviceManager.select(device);
            console.log('Switched to tablet view');
          } else {
            console.warn('Tablet device not found');
          }
        }
      });

      commands.add('set-device-mobile', {
        run: (editor) => {
          const device = deviceManager.get('mobile') || deviceManager.getAll().find(d => d.get('name') === 'Mobile');
          if (device) {
            deviceManager.select(device);
            console.log('Switched to mobile view');
          } else {
            console.warn('Mobile device not found');
          }
        }
      });

      console.log('Device commands fixed successfully');
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
          minHeight: '800px'
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
