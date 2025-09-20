// GrapesJS Widget for Decap CMS - Clean Version
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
        
        // Load GrapesJS Style Background plugin from CDN
        await loadScript('https://unpkg.com/grapesjs-style-bg@2.0.2/dist/index.js');
        
        // Load GrapesJS Custom Code plugin from CDN
        await loadScript('https://unpkg.com/grapesjs-custom-code@1.0.2/dist/index.js');

        // Load GrapesJS Countdown Components plugin from CDN
        await loadScript('https://unpkg.com/grapesjs-component-countdown@1.0.1/dist/index.js');

        // Load CodeMirror separately to ensure it's available
        if (!window.CodeMirror) {
          await loadScript('https://unpkg.com/codemirror@5.65.2/lib/codemirror.js');
          await loadStylesheet('https://unpkg.com/codemirror@5.65.2/lib/codemirror.css');
          await loadStylesheet('https://unpkg.com/codemirror@5.65.2/theme/hopscotch.css');
          await loadStylesheet('https://unpkg.com/codemirror@5.65.2/theme/monokai.css');
          await loadScript('https://unpkg.com/codemirror@5.65.2/mode/xml/xml.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/mode/css/css.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/mode/javascript/javascript.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/mode/htmlmixed/htmlmixed.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/edit/closetag.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/edit/closebrackets.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/edit/matchbrackets.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/selection/active-line.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/fold/foldcode.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/fold/foldgutter.js');
          await loadScript('https://unpkg.com/codemirror@5.65.2/addon/fold/xml-fold.js');
          await loadStylesheet('https://unpkg.com/codemirror@5.65.2/addon/fold/foldgutter.css');
          // Load formatting addon
          await loadScript('https://unpkg.com/js-beautify@1.14.7/js/lib/beautify.js');
          await loadScript('https://unpkg.com/js-beautify@1.14.7/js/lib/beautify-css.js');
          await loadScript('https://unpkg.com/js-beautify@1.14.7/js/lib/beautify-html.js');
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
        const possibleStyleBgNames = ['grapesjs-style-bg', 'style-bg'];
        const possibleCustomCodeNames = ['grapesjs-custom-code', 'custom-code'];
        const possibleCountdownNames = ['grapesjs-component-countdown', 'component-countdown', 'countdown'];
        
        let basicPluginName = null;
        let tuiPluginName = null;
        let formsPluginName = null;
        let presetPluginName = null;
        let styleBgPluginName = null;
        let customCodePluginName = null;
        let countdownPluginName = null;
        
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
        
        for (const name of possibleStyleBgNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            styleBgPluginName = name;
            break;
          }
        }
        
        for (const name of possibleCustomCodeNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            customCodePluginName = name;
            break;
          }
        }
        
        for (const name of possibleCountdownNames) {
          if (window.grapesjs.plugins && window.grapesjs.plugins[name]) {
            countdownPluginName = name;
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
        
        if (!styleBgPluginName) {
          styleBgPluginName = 'grapesjs-style-bg'; // Default attempt
        }
        
        if (!customCodePluginName) {
          customCodePluginName = 'grapesjs-custom-code'; // Default attempt
        }
        
        if (!countdownPluginName) {
          countdownPluginName = 'grapesjs-component-countdown'; // Default attempt
        }

        // Initialize GrapesJS with all plugins
        try {
          this.editor = window.grapesjs.init({
            container: `#${containerId}`,
            height: '800px',
            width: 'auto',
            fromElement: false,
            showOffsets: true,
            noticeOnUnload: false,
            storageManager: false,
            
            // Load all plugins including Style Background, Custom Code, and Countdown
            plugins: [basicPluginName, tuiPluginName, formsPluginName, presetPluginName, styleBgPluginName, customCodePluginName, countdownPluginName],
            
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
              },
              [styleBgPluginName]: {
                colorPicker: true,
                imagePicker: true,
                gradients: true,
              },
              [customCodePluginName]: {
                // Custom Code plugin options
                blockCustomCode: {
                  category: 'Extra',
                  label: 'Custom Code',
                  content: `
                    <div data-gjs-type="custom-code" data-gjs-editable="false" data-gjs-removable="true" data-gjs-copyable="true" data-gjs-highlightable="true" data-gjs-selectable="true">
                      <div style="padding: 10px; background: #f4f4f4; border: 1px dashed #ccc; text-align: center; color: #666;">
                        Custom Code Block<br>
                        <small>Double-click to edit</small>
                      </div>
                    </div>
                  `,
                  attributes: { class: 'fa fa-code' }
                },
                modalTitle: 'Edit Custom Code',
                codeViewOptions: {
                  theme: 'hopscotch',
                  readOnly: false,
                  autoCloseTags: true,
                  autoCloseBrackets: true,
                  lineWrapping: true,
                  styleActiveLine: true,
                  smartIndent: true,
                  indentWithTabs: true
                },
                buttonLabel: 'Save',
                commandCustomCode: {
                  id: 'custom-code-edit'
                },
                // Placeholder for empty custom code blocks
                placeholderContent: `
                  <div style="padding: 20px; text-align: center; color: #999; font-style: italic;">
                    Add your custom HTML/CSS/JS code here
                  </div>
                `
              }
            },
            [countdownPluginName]: {
              // Countdown component plugin options
              block: {
                category: 'Extra',
                label: 'Countdown',
                content: `<div data-gjs-type="countdown" class="countdown-component"></div>`,
                attributes: { class: 'fa fa-clock-o' }
              },
              component: {
                // Default countdown options
                dateInputType: 'date',
                defaultDate: '',
                endText: 'Countdown Ended!',
                dayText: 'Days',
                hourText: 'Hours', 
                minuteText: 'Minutes',
                secondText: 'Seconds'
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

            // Initial content - process scripts if they exist
            components: this.processInitialContent(value) || '<div class="container"><h1>Welcome!</h1><p>Start building your page by dragging components from the right panel.</p></div>',
          });
          
          console.log('GrapesJS editor with plugins initialized successfully');
          
          // Debug plugin configuration
          setTimeout(() => {
            const importCmd = this.editor.Commands.get('gjs-open-import-webpage');
            
            // Test the import command to see what happens
            if (importCmd) {
              // Override the existing command with our custom implementation
              this.editor.Commands.add('gjs-open-import-webpage', {
                run: (editor) => {
                  console.log('Custom import command running...');
                  const modal = editor.Modal;
                  
                  // Get current content
                  const html = editor.getHtml();
                  const css = editor.getCss();
                  const currentContent = html + (css ? '\n\n<style>\n' + css + '\n</style>' : '');
                  
                  // Create modal content container
                  const modalContent = document.createElement('div');
                  modalContent.style.padding = '10px';
                  
                  // Add label
                  const label = document.createElement('label');
                  label.textContent = 'Paste your HTML/CSS code here';
                  label.style.display = 'block';
                  label.style.marginBottom = '10px';
                  label.style.fontWeight = 'bold';
                  modalContent.appendChild(label);
                  
                  // Add code editor container
                  const editorContainer = document.createElement('div');
                  editorContainer.style.border = '1px solid #ddd';
                  editorContainer.style.borderRadius = '4px';
                  editorContainer.style.minHeight = '300px';
                  editorContainer.style.backgroundColor = '#f8f8f8';
                  modalContent.appendChild(editorContainer);
                  
                  // Add import button
                  const buttonContainer = document.createElement('div');
                  buttonContainer.style.textAlign = 'right';
                  buttonContainer.style.marginTop = '10px';
                  
                  const importBtn = document.createElement('button');
                  importBtn.textContent = 'Import';
                  importBtn.style.padding = '8px 16px';
                  importBtn.style.backgroundColor = '#007cba';
                  importBtn.style.color = 'white';
                  importBtn.style.border = 'none';
                  importBtn.style.borderRadius = '4px';
                  importBtn.style.cursor = 'pointer';
                  
                  buttonContainer.appendChild(importBtn);
                  modalContent.appendChild(buttonContainer);

                  // Open modal first
                  modal.open({
                    title: 'Import Code',
                    content: modalContent
                  });
                  
                  // Initialize CodeMirror after modal is open
                  setTimeout(() => {
                    try {
                      console.log('Initializing CodeMirror...');
                      
                      // Check if CodeMirror is available globally
                      if (typeof CodeMirror !== 'undefined') {
                        console.log('CodeMirror available globally');
                        
                        // Create CodeMirror instance directly
                        const cmInstance = CodeMirror(editorContainer, {
                          value: '', // Start empty, we'll set formatted content after
                          mode: 'htmlmixed',
                          theme: 'monokai',
                          lineNumbers: true,
                          autoCloseTags: true,
                          autoCloseBrackets: true,
                          lineWrapping: true,
                          styleActiveLine: true,
                          matchBrackets: true,
                          indentUnit: 2,
                          tabSize: 2,
                          foldGutter: true,
                          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                          extraKeys: {
                            'Ctrl-Space': 'autocomplete',
                            'F11': function(cm) {
                              cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                            },
                            'Esc': function(cm) {
                              if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                            },
                            'Ctrl-F': 'findPersistent',
                            'Ctrl-Alt-F': function(cm) {
                              // Format code function
                              formatCode(cm);
                            }
                          }
                        });
                        
                        // Add format code function
                        function formatCode(cm) {
                          try {
                            const code = cm.getValue();
                            let formatted = code;
                            
                            // Check if js-beautify is available
                            if (typeof html_beautify !== 'undefined') {
                              formatted = html_beautify(code, {
                                indent_size: 2,
                                indent_char: ' ',
                                max_preserve_newlines: 2,
                                preserve_newlines: true,
                                keep_array_indentation: false,
                                break_chained_methods: false,
                                indent_scripts: 'keep',
                                brace_style: 'collapse',
                                space_before_conditional: true,
                                unescape_strings: false,
                                jslint_happy: false,
                                end_with_newline: false,
                                wrap_line_length: 0,
                                indent_inner_html: false,
                                comma_first: false,
                                e4x: false,
                                indent_empty_lines: false
                              });
                            }
                            
                            cm.setValue(formatted);
                            console.log('Code formatted successfully');
                          } catch (error) {
                            console.error('Code formatting failed:', error);
                          }
                        }
                        
                        // Set content and auto-format when first loaded
                        setTimeout(() => {
                          cmInstance.setValue(currentContent);
                          
                          // Auto-format the code on initial load
                          setTimeout(() => {
                            formatCode(cmInstance);
                            console.log('Code auto-formatted on load');
                          }, 100);
                        }, 50);
                        
                        // Add format button
                        const formatBtn = document.createElement('button');
                        formatBtn.textContent = 'Format Code';
                        formatBtn.style.padding = '4px 8px';
                        formatBtn.style.marginRight = '10px';
                        formatBtn.style.backgroundColor = '#28a745';
                        formatBtn.style.color = 'white';
                        formatBtn.style.border = 'none';
                        formatBtn.style.borderRadius = '3px';
                        formatBtn.style.cursor = 'pointer';
                        formatBtn.style.fontSize = '12px';
                        
                        formatBtn.onclick = () => formatCode(cmInstance);
                        buttonContainer.insertBefore(formatBtn, importBtn);
                        
                        // Style the CodeMirror instance
                        cmInstance.setSize('100%', '350px');
                        
                        // Add custom CSS for better appearance
                        const styleElement = document.createElement('style');
                        styleElement.textContent = `
                          .CodeMirror {
                            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', monospace !important;
                            font-size: 14px !important;
                            line-height: 1.5 !important;
                          }
                          .CodeMirror-selected {
                            background: rgba(255, 255, 255, 0.1) !important;
                          }
                          .CodeMirror-line {
                            padding-left: 4px !important;
                          }
                          .CodeMirror-gutters {
                            border-right: 1px solid #3e3e3e !important;
                          }
                          .cm-tag {
                            color: #f92672 !important;
                          }
                          .cm-attribute {
                            color: #a6e22e !important;
                          }
                          .cm-string {
                            color: #e6db74 !important;
                          }
                          .cm-bracket {
                            color: #f8f8f2 !important;
                          }
                          .cm-comment {
                            color: #75715e !important;
                            font-style: italic !important;
                          }
                        `;
                        document.head.appendChild(styleElement);
                        
                        // Update import button to use CodeMirror
                        importBtn.onclick = () => {
                          const code = cmInstance.getValue();
                          console.log('Importing code from CodeMirror:', code);
                          if (code.trim()) {
                            editor.setComponents(code);
                            modal.close();
                          }
                        };
                        
                        // Refresh CodeMirror after a short delay
                        setTimeout(() => {
                          cmInstance.refresh();
                          console.log('CodeMirror refreshed');
                        }, 100);
                        
                        console.log('CodeMirror successfully initialized');
                      } else {
                        console.log('CodeMirror not available globally, trying alternative methods...');
                        
                        // Method 2: Try to use GrapesJS's internal command to open code editor
                        try {
                          const existingCodeCmd = editor.Commands.get('core:code-edit');
                          if (existingCodeCmd) {
                            console.log('Using GrapesJS core code edit command');
                            // Use a simple textarea with better styling
                            editorContainer.innerHTML = `
                              <div style="position: relative; background: #1e1e1e; border-radius: 4px;">
                                <textarea 
                                  style="
                                    width: 100%; 
                                    height: 300px; 
                                    background: #1e1e1e; 
                                    color: #e6e6e6; 
                                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                                    font-size: 14px;
                                    padding: 15px; 
                                    border: none; 
                                    resize: none; 
                                    outline: none;
                                    line-height: 1.4;
                                    tab-size: 2;
                                  " 
                                  placeholder="Paste your HTML/CSS code here..."
                                >${currentContent}</textarea>
                              </div>
                            `;
                            const textarea = editorContainer.querySelector('textarea');
                            
                            // Add tab support
                            textarea.addEventListener('keydown', function(e) {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                const start = this.selectionStart;
                                const end = this.selectionEnd;
                                this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
                                this.selectionStart = this.selectionEnd = start + 2;
                              }
                            });
                            
                            importBtn.onclick = () => {
                              const code = textarea.value;
                              if (code.trim()) {
                                editor.setComponents(code);
                                modal.close();
                              }
                            };
                            
                          } else {
                            // Absolute fallback
                            editorContainer.innerHTML = `
                              <textarea style="width:100%; height:300px; font-family:monospace; padding:10px; border:1px solid #ddd; resize:none;">${currentContent}</textarea>
                            `;
                            const textarea = editorContainer.querySelector('textarea');
                            importBtn.onclick = () => {
                              const code = textarea.value;
                              if (code.trim()) {
                                editor.setComponents(code);
                                modal.close();
                              }
                            };
                          }
                        } catch (fallbackError) {
                          // Final fallback
                          editorContainer.innerHTML = `
                            <textarea style="width:100%; height:300px; font-family:monospace; padding:10px; border:1px solid #ddd; resize:none;">${currentContent}</textarea>
                          `;
                          const textarea = editorContainer.querySelector('textarea');
                          importBtn.onclick = () => {
                            const code = textarea.value;
                            if (code.trim()) {
                              editor.setComponents(code);
                              modal.close();
                            }
                          };
                        }
                      }
                    } catch (cmError) {
                      // Fallback to basic textarea
                      editorContainer.innerHTML = `
                        <textarea style="width:100%; height:300px; font-family:monospace; padding:10px; border:1px solid #ddd; resize:none;">${currentContent}</textarea>
                      `;
                      const textarea = editorContainer.querySelector('textarea');
                      importBtn.onclick = () => {
                        const code = textarea.value;
                        if (code.trim()) {
                          editor.setComponents(code);
                          modal.close();
                        }
                      };
                    }
                  }, 300);
                }
              });
            } else {
              console.warn('Import command not found - preset webpage plugin may not be loaded correctly');
            }
            
          }, 500);
          
          // Fix device commands to work with existing toolbar
          this.fixDeviceCommands();
          
        } catch (pluginError) {
          // Fallback: Initialize without plugins
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

            // Initial content
            components: value || '<div class="container"><h1>Welcome!</h1><p>Start building your page by dragging components from the right panel.</p></div>',
          });
          
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

        // Set up load listener to validate countdown components and handle initial content
        this.editor.on('load', () => {
          console.log('Editor loaded, validating countdown components...');
          
          // If this is a new page with no content, ensure default content is saved
          if (!value || value.trim() === '') {
            console.log('New page detected, setting default content...');
            const defaultContent = '<div class="container"><h1>Welcome!</h1><p>Start building your page by dragging components from the right panel.</p></div>';
            
            // Set the content in state and trigger onChange
            this.setState({ value: defaultContent });
            if (onChange) {
              onChange(defaultContent);
            }
          }
          
          setTimeout(() => {
            this.validateCountdownComponents();
          }, 2000);
        });

        // Add canvas:ready listener to ensure content is captured when editor is fully ready
        this.editor.on('canvas:ready', () => {
          console.log('Canvas ready, capturing current content...');
          
          // Get current content from editor
          const html = this.editor.getHtml();
          const css = this.editor.getCss();
          const fullContent = html + (css ? `<style>${css}</style>` : '');
          
          // Update state and trigger onChange to ensure content is saved
          this.setState({ value: fullContent });
          if (onChange) {
            onChange(fullContent);
          }
        });

        // Automatically activate component outlines (View Component button)
        setTimeout(() => {
          try {
            // Run the command and make sure the button shows as active
            this.editor.runCommand('sw-visibility');
            
            // Force the button to show as active/pressed
            setTimeout(() => {
              // Find the sw-visibility button and mark it as active
              const toolbar = this.editor.Panels.getPanel('options');
              if (toolbar) {
                const swVisibilityBtn = toolbar.get('buttons').find(btn => 
                  btn.get('command') === 'sw-visibility' || 
                  btn.get('id') === 'sw-visibility'
                );
                
                if (swVisibilityBtn) {
                  // Set the button as active
                  swVisibilityBtn.set('active', true);
                  console.log('✅ Component outlines activated and button set to active state');
                } else {
                  console.log('❌ sw-visibility button not found in toolbar');
                }
              }
            }, 100);
            
          } catch (error) {
            console.log('❌ Error activating component outlines:', error);
          }
        }, 1000);

        // Ensure Tailwind CSS is loaded in iframe
        this.ensureTailwindLoaded();

        // Ensure default content is properly captured and saved for new pages
        setTimeout(() => {
          if (!value || value.trim() === '') {
            console.log('Ensuring default content is captured for new page...');
            
            const html = this.editor.getHtml();
            const css = this.editor.getCss();
            const fullContent = html + (css ? `<style>${css}</style>` : '');
            
            if (fullContent && fullContent.trim() !== '') {
              this.setState({ value: fullContent });
              if (onChange) {
                onChange(fullContent);
                console.log('✅ Default content saved for new page');
              }
            }
          }
        }, 2000);

      } catch (error) {
        console.error('Error initializing GrapesJS editor:', error);
        this.setState({ error: 'Failed to initialize editor: ' + error.message });
      }
    },

    processInitialContent(content) {
      if (!content) return content;
      
      try {
        let processedContent = content;
        
        // Check if content contains countdown elements that need to be restored
        if (content.includes('data-js="countdown"') || content.includes('countdown-digit')) {
          console.log('Found countdown components in content, restoring component attributes...');
          
          // Restore countdown component attributes
          // Look for countdown container elements and add the proper GrapesJS attributes
          processedContent = processedContent.replace(
            /<div([^>]*class="[^"]*countdown[^"]*"[^>]*)>/gi,
            '<div$1 data-gjs-type="countdown">'
          );
          
          // Also check for elements with countdown structure
          processedContent = processedContent.replace(
            /<div([^>]*?)>\s*<span[^>]*data-js="countdown"[^>]*>/gi,
            '<div$1 data-gjs-type="countdown"><span data-js="countdown" class="countdown-cont">'
          );
          
          console.log('✅ Countdown component attributes restored');
        }
        
        // Check if content contains scripts (like countdown scripts)
        if (content.includes('<script>') && content.includes('__gjsCountdownInterval')) {
          console.log('Found countdown scripts in initial content, processing...');
          
          // Store scripts for later execution in the iframe
          this.initialScripts = [];
          
          // Extract scripts from content
          const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
          let match;
          
          while ((match = scriptRegex.exec(content)) !== null) {
            const scriptContent = match[1];
            if (scriptContent.includes('__gjsCountdownInterval') || scriptContent.includes('var props =')) {
              this.initialScripts.push(scriptContent);
              console.log('Stored countdown script for execution');
            }
          }
          
          // Schedule script execution after editor loads
          setTimeout(() => {
            this.executeInitialScripts();
            // Validate and fix countdown component types after scripts execute
            setTimeout(() => {
              this.validateCountdownComponents();
            }, 1000);
          }, 3000);
        }
        
        return processedContent;
      } catch (error) {
        console.error('Error processing initial content:', error);
        return content;
      }
    },

    executeInitialScripts() {
      if (!this.editor || !this.initialScripts || this.initialScripts.length === 0) return;
      
      try {
        const iframe = this.editor.Canvas.getFrameEl();
        if (iframe && iframe.contentDocument) {
          const doc = iframe.contentDocument;
          
          console.log(`Executing ${this.initialScripts.length} initial countdown scripts`);
          
          this.initialScripts.forEach((scriptContent, index) => {
            try {
              // Create and execute script in iframe
              const script = doc.createElement('script');
              script.textContent = scriptContent;
              doc.head.appendChild(script);
              
              console.log(`✅ Initial countdown script ${index + 1} executed successfully`);
            } catch (error) {
              console.log(`❌ Error executing initial script ${index + 1}:`, error);
            }
          });
          
          // Clear the stored scripts
          this.initialScripts = null;
        }
      } catch (error) {
        console.error('❌ Error executing initial scripts:', error);
      }
    },

    // Check and fix component types after loading
    validateCountdownComponents() {
      if (!this.editor) return;
      
      try {
        console.log('Validating countdown components...');
        
        // Get all components from the editor
        const components = this.editor.DomComponents.getComponents();
        
        const checkComponent = (component) => {
          try {
            // Get component HTML content to check for countdown patterns
            const componentHtml = component.toHTML();
            
            // Check if component HTML contains countdown patterns
            const hasCountdownData = componentHtml.includes('data-js="countdown"');
            const hasCountdownClass = componentHtml.includes('class="') && componentHtml.includes('countdown');
            const hasCountdownDigit = componentHtml.includes('countdown-digit');
            
            if (hasCountdownData || hasCountdownClass || hasCountdownDigit) {
              const currentType = component.get('type');
              if (currentType !== 'countdown') {
                console.log('Found countdown element with wrong type, fixing...', currentType);
                console.log('Component HTML:', componentHtml.substring(0, 200) + '...');
                
                // Set the correct component type
                component.set('type', 'countdown');
                
                // Add the countdown trait if missing
                const traits = component.get('traits') || [];
                const hasCountdownTrait = traits.some(t => t.name === 'countdown-date');
                
                if (!hasCountdownTrait) {
                  component.set('traits', [
                    ...traits,
                    {
                      type: 'text',
                      name: 'countdown-date',
                      label: 'Target Date',
                      value: '2024-12-31'
                    }
                  ]);
                }
                
                console.log('✅ Fixed countdown component type');
              }
            }
            
            // Check child components recursively
            const childComponents = component.components();
            if (childComponents && typeof childComponents.each === 'function') {
              childComponents.each(child => checkComponent(child));
            }
            
          } catch (componentError) {
            console.warn('Error checking individual component:', componentError);
          }
        };
        
        if (components && typeof components.each === 'function') {
          components.each(component => checkComponent(component));
        }
        
      } catch (error) {
        console.error('Error validating countdown components:', error);
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