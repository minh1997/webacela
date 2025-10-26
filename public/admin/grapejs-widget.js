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
          error: 'Không thể tải trình chỉnh sửa trực quan: ' + error.message,
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
            
            // i18n configuration for Vietnamese
            i18n: {
              locale: 'vi',
              detectLocale: false,
              messages: {
                vi: {
                  styleManager: {
                    properties: {
                      'text-align': 'Căn chỉnh văn bản',
                      'color': 'Màu chữ',
                      'background-color': 'Màu nền',
                      'font-family': 'Font chữ',
                      'font-size': 'Kích thước chữ',
                      'font-weight': 'Độ đậm chữ',
                      'letter-spacing': 'Khoảng cách chữ',
                      'line-height': 'Độ cao dòng',
                      'text-decoration': 'Trang trí văn bản',
                      'text-shadow': 'Bóng chữ',
                      'border': 'Viền',
                      'border-radius': 'Bo góc',
                      'border-width': 'Độ dày viền',
                      'border-style': 'Kiểu viền',
                      'border-color': 'Màu viền',
                      'box-shadow': 'Bóng đổ',
                      'background': 'Nền',
                      'background-image': 'Ảnh nền',
                      'background-repeat': 'Lặp lại nền',
                      'background-position': 'Vị trí nền',
                      'background-size': 'Kích thước nền',
                      'width': 'Chiều rộng',
                      'height': 'Chiều cao',
                      'max-width': 'Chiều rộng tối đa',
                      'max-height': 'Chiều cao tối đa',
                      'min-width': 'Chiều rộng tối thiểu',
                      'min-height': 'Chiều cao tối thiểu',
                      'margin': 'Lề ngoài',
                      'margin-top': 'Lề trên',
                      'margin-right': 'Lề phải',
                      'margin-bottom': 'Lề dưới',
                      'margin-left': 'Lề trái',
                      'padding': 'Lề trong',
                      'padding-top': 'Lề trong trên',
                      'padding-right': 'Lề trong phải',
                      'padding-bottom': 'Lề trong dưới',
                      'padding-left': 'Lề trong trái',
                      'display': 'Hiển thị',
                      'position': 'Vị trí',
                      'top': 'Trên',
                      'right': 'Phải',
                      'bottom': 'Dưới',
                      'left': 'Trái',
                      'float': 'Nổi',
                      'opacity': 'Độ mờ',
                      'cursor': 'Con trỏ',
                      'overflow': 'Tràn',
                      'z-index': 'Thứ tự Z',
                      'flex-direction': 'Hướng flex',
                      'justify-content': 'Căn nội dung',
                      'align-items': 'Căn mục',
                      'flex-wrap': 'Ngắt dòng flex',
                      'transition': 'Chuyển động',
                      'transform': 'Biến đổi',
                    },
                    sectors: {
                      general: 'Chung',
                      layout: 'Bố cục',
                      typography: 'Kiểu chữ',
                      decorations: 'Trang trí',
                      extra: 'Thêm',
                      flex: 'Flex',
                      dimension: 'Kích thước',
                    }
                  },
                  traitManager: {
                    empty: 'Chọn một phần tử trước khi sử dụng Trình quản lý Trait',
                    label: 'Cài đặt thành phần',
                    traits: {
                      labels: {
                        id: 'Id',
                        title: 'Tiêu đề',
                        alt: 'Văn bản thay thế',
                        href: 'Liên kết',
                        target: 'Đích',
                        name: 'Tên',
                        placeholder: 'Chữ mờ',
                        value: 'Giá trị',
                        type: 'Loại',
                        required: 'Bắt buộc',
                        checked: 'Đã chọn',
                      },
                      options: {
                        target: {
                          false: 'Trang này',
                          _blank: 'Cửa sổ mới',
                        },
                      },
                    },
                  },
                  domComponents: {
                    names: {
                      '': 'Hộp',
                      wrapper: 'Body',
                      text: 'Văn bản',
                      comment: 'Bình luận',
                      image: 'Hình ảnh',
                      video: 'Video',
                      label: 'Nhãn',
                      link: 'Liên kết',
                      map: 'Bản đồ',
                      tfoot: 'Chân bảng',
                      tbody: 'Thân bảng',
                      thead: 'Đầu bảng',
                      table: 'Bảng',
                      row: 'Hàng bảng',
                      cell: 'Ô bảng',
                    },
                  },
                  deviceManager: {
                    device: 'Thiết bị',
                    devices: {
                      desktop: 'Máy tính',
                      tablet: 'Máy tính bảng',
                      mobileLandscape: 'Di động ngang',
                      mobilePortrait: 'Di động dọc',
                    },
                  },
                  panels: {
                    buttons: {
                      titles: {
                        preview: 'Xem trước',
                        fullscreen: 'Toàn màn hình',
                        'sw-visibility': 'Xem các thành phần',
                        'export-template': 'Xem mã',
                        'open-sm': 'Mở Trình quản lý Kiểu',
                        'open-tm': 'Cài đặt',
                        'open-layers': 'Mở Trình quản lý Lớp',
                        'open-blocks': 'Mở Khối',
                      },
                    },
                  },
                  selectorManager: {
                    label: 'Lớp',
                    selected: 'Đã chọn',
                    emptyState: '- Trạng thái -',
                    states: {
                      hover: 'Di chuột',
                      active: 'Nhấp',
                      'nth-of-type(2n)': 'Chẵn/Lẻ',
                    },
                  },
                  blockManager: {
                    labels: {
                      // Blocks from basic plugin
                      'column1': '1 Cột',
                      'column2': '2 Cột',
                      'column3': '3 Cột',
                      'column3-7': '2 Cột 3/7',
                      'text': 'Văn bản',
                      'link': 'Liên kết',
                      'image': 'Hình ảnh',
                      'video': 'Video',
                      'map': 'Bản đồ',
                      
                      // Blocks from forms plugin
                      'form': 'Biểu mẫu',
                      'input': 'Nhập liệu',
                      'textarea': 'Văn bản lớn',
                      'select': 'Chọn',
                      'button': 'Nút',
                      'label': 'Nhãn',
                      'checkbox': 'Hộp kiểm',
                      'radio': 'Nút radio',
                      
                      // Blocks from preset webpage
                      'link-block': 'Khối liên kết',
                      'quote': 'Trích dẫn',
                      'text-basic': 'Đoạn văn bản',
                    },
                    categories: {
                      'Basic': 'Cơ bản',
                      'Forms': 'Biểu mẫu',
                      'Extra': 'Thêm',
                    },
                  },
                  assetManager: {
                    addButton: 'Thêm hình ảnh',
                    inputPlh: 'http://đường/dẫn/đến/hình/ảnh.jpg',
                    modalTitle: 'Chọn hình ảnh',
                    uploadTitle: 'Thả file vào đây hoặc nhấp để tải lên',
                  },
                  layerManager: {
                    category: 'Lớp',
                    layer: 'Lớp',
                    layers: 'Lớp',
                    back: 'Quay lại',
                    selectParent: 'Chọn cha',
                  },
                  commands: {
                    'fullscreen': 'Toàn màn hình',
                    'preview': 'Xem trước',
                    'sw-visibility': 'Hiển thị đường viền',
                  },
                  rte: {
                    bold: 'Đậm',
                    italic: 'Nghiêng',
                    underline: 'Gạch dưới',
                    strikethrough: 'Gạch ngang',
                    link: 'Liên kết',
                    wrap: 'Ngắt dòng',
                  },
                },
              },
            },
            
            // Load all plugins including Style Background, Custom Code, and Countdown
            plugins: [basicPluginName, tuiPluginName, formsPluginName, presetPluginName, styleBgPluginName, customCodePluginName, countdownPluginName],
            
            // Plugin options
            pluginOpts: {
              [basicPluginName]: {
                blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
                category: {
                  id: 'basic',
                  label: 'Cơ bản',
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
                category: 'Biểu mẫu'
              },
              [presetPluginName]: {
                blocks: ['link-block', 'quote', 'text-basic'],
                modalImportTitle: 'Nhập Mã',
                modalImportButton: 'Nhập',
                modalImportLabel: 'Dán mã HTML/CSS của bạn vào đây',
                textCleanCanvas: 'Bạn có chắc chắn muốn xóa toàn bộ trang?',
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
                  category: 'Thêm',
                  label: 'Mã Tùy Chỉnh',
                  content: `
                    <div data-gjs-type="custom-code" data-gjs-editable="false" data-gjs-removable="true" data-gjs-copyable="true" data-gjs-highlightable="true" data-gjs-selectable="true">
                      <div style="padding: 10px; background: #f4f4f4; border: 1px dashed #ccc; text-align: center; color: #666;">
                        Khối Mã Tùy Chỉnh<br>
                        <small>Nhấp đúp để chỉnh sửa</small>
                      </div>
                    </div>
                  `,
                  attributes: { class: 'fa fa-code' }
                },
                modalTitle: 'Chỉnh Sửa Mã Tùy Chỉnh',
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
                buttonLabel: 'Lưu',
                commandCustomCode: {
                  id: 'custom-code-edit'
                },
                // Placeholder for empty custom code blocks
                placeholderContent: `
                  <div style="padding: 20px; text-align: center; color: #999; font-style: italic;">
                    Thêm mã HTML/CSS/JS tùy chỉnh của bạn vào đây
                  </div>
                `
              }
            },
            [countdownPluginName]: {
              // Countdown component plugin options
              block: {
                category: 'Thêm',
                label: 'Đếm Ngược',
                content: `<div data-gjs-type="countdown" class="countdown-component"></div>`,
                attributes: { class: 'fa fa-clock-o' }
              },
              component: {
                // Default countdown options
                dateInputType: 'date',
                defaultDate: '',
                endText: 'Đã Kết Thúc!',
                dayText: 'Ngày',
                hourText: 'Giờ', 
                minuteText: 'Phút',
                secondText: 'Giây'
              }
            },
            
            // Canvas settings
            canvas: {
              scripts: [
                'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
              ]
            },

            // Device Manager
            deviceManager: {
              devices: [{
                name: 'Máy tính',
                width: '',
              }, 
              {
                name: 'Máy tính bảng',
                width: '768px',
                widthMedia: '992px',
              },
              {
                name: 'Điện thoại',
                width: '320px',
                widthMedia: '480px',
              }]
            },

            // Initial content - process scripts if they exist
            components: this.processInitialContent(value) || '<div class="container mx-auto px-4 py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen"><div class="max-w-4xl mx-auto text-center"><h1 class="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chào mừng đến với WebAcela!</h1><p class="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">Bắt đầu xây dựng trang tuyệt vời của bạn bằng cách kéo thả các thành phần từ bảng bên phải. Tạo các bố cục đẹp mắt, đáp ứng với trình chỉnh sửa trực quan của chúng tôi.</p><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-blue-500 text-3xl mb-4">🎨</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Kéo & Thả</h3><p class="text-gray-600">Dễ dàng thêm các thành phần bằng cách kéo chúng từ bảng khối</p></div><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-purple-500 text-3xl mb-4">📱</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Thiết Kế Đáp Ứng</h3><p class="text-gray-600">Trang của bạn sẽ trông tuyệt vời trên mọi thiết bị</p></div><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-green-500 text-3xl mb-4">⚡</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Nhanh & Hiện Đại</h3><p class="text-gray-600">Được xây dựng với công nghệ web mới nhất để có hiệu suất tối ưu</p></div></div><div class="bg-white p-8 rounded-xl shadow-lg"><h2 class="text-2xl font-bold text-gray-800 mb-4">Sẵn Sàng Bắt Đầu?</h2><p class="text-gray-600 mb-6">Chọn từ các khối được thiết kế sẵn hoặc tạo các thành phần tùy chỉnh của riêng bạn</p><button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">Bắt Đầu Xây Dựng</button></div></div></div>',
          });
          
          console.log('GrapesJS editor with plugins initialized successfully');
          
          // Override basic plugin blocks with Tailwind classes
          this.overrideBasicBlocks();
          
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
                  label.textContent = 'Dán mã HTML/CSS của bạn vào đây';
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
                  importBtn.textContent = 'Nhập';
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
                    title: 'Nhập Mã',
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
                        formatBtn.textContent = 'Định Dạng Mã';
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
                                  placeholder="Dán mã HTML/CSS của bạn vào đây..."
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
            components: value || '<div class="container mx-auto px-4 py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen"><div class="max-w-4xl mx-auto text-center"><h1 class="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chào mừng đến với WebAcela!</h1><p class="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">Bắt đầu xây dựng trang tuyệt vời của bạn bằng cách kéo thả các thành phần từ bảng bên phải. Tạo các bố cục đẹp mắt, đáp ứng với trình chỉnh sửa trực quan của chúng tôi.</p><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-blue-500 text-3xl mb-4">🎨</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Kéo & Thả</h3><p class="text-gray-600">Dễ dàng thêm các thành phần bằng cách kéo chúng từ bảng khối</p></div><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-purple-500 text-3xl mb-4">📱</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Thiết Kế Đáp Ứng</h3><p class="text-gray-600">Trang của bạn sẽ trông tuyệt vời trên mọi thiết bị</p></div><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-green-500 text-3xl mb-4">⚡</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Nhanh & Hiện Đại</h3><p class="text-gray-600">Được xây dựng với công nghệ web mới nhất để có hiệu suất tối ưu</p></div></div><div class="bg-white p-8 rounded-xl shadow-lg"><h2 class="text-2xl font-bold text-gray-800 mb-4">Sẵn Sàng Bắt Đầu?</h2><p class="text-gray-600 mb-6">Chọn từ các khối được thiết kế sẵn hoặc tạo các thành phần tùy chỉnh của riêng bạn</p><button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">Bắt Đầu Xây Dựng</button></div></div></div>',
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
            const defaultContent = '<div class="container mx-auto px-4 py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen"><div class="max-w-4xl mx-auto text-center"><h1 class="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to WebAcela!</h1><p class="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">Start building your amazing page by dragging components from the right panel. Create beautiful, responsive layouts with our visual editor.</p><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-blue-500 text-3xl mb-4">🎨</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Drag & Drop</h3><p class="text-gray-600">Easily add components by dragging them from the blocks panel</p></div><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-purple-500 text-3xl mb-4">📱</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Responsive Design</h3><p class="text-gray-600">Your pages will look great on all devices automatically</p></div><div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"><div class="text-green-500 text-3xl mb-4">⚡</div><h3 class="text-lg font-semibold text-gray-800 mb-2">Fast & Modern</h3><p class="text-gray-600">Built with the latest web technologies for optimal performance</p></div></div><div class="bg-white p-8 rounded-xl shadow-lg"><h2 class="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2><p class="text-gray-600 mb-6">Choose from our pre-designed blocks or create your own custom components</p><button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">Start Building</button></div></div></div>';
            
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

        // Add fullscreen functionality with hover overlay
        this.addFullscreenOverlay();
        
        // Setup GrapesJS fullscreen command integration
        this.setupFullscreenCommand();

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

    overrideBasicBlocks() {
      if (!this.editor) return;
      
      try {
        console.log('Overriding basic blocks with Tailwind classes...');
        const blockManager = this.editor.BlockManager;
        
        // Override text block
        const textBlock = blockManager.get('text');
        if (textBlock) {
          textBlock.set('content', '<p class="text-gray-700 leading-relaxed">Chèn văn bản của bạn vào đây</p>');
          console.log('✅ Text block updated with Tailwind classes');
        }

        // Override link block
        const linkBlock = blockManager.get('link');
        if (linkBlock) {
          linkBlock.set('content', '<a href="#" class="text-blue-600 hover:text-blue-800 underline transition duration-300">Văn bản liên kết</a>');
          console.log('✅ Link block updated with Tailwind classes');
        }

        // Override text-basic block from preset webpage plugin
        const textBasicBlock = blockManager.get('text-basic');
        if (textBasicBlock) {
          textBasicBlock.set('content', '<div class="prose max-w-none p-6 bg-white rounded-lg shadow-sm"><h2 class="text-2xl font-bold text-gray-800 mb-4">Tiêu đề</h2><p class="text-gray-600 leading-relaxed mb-4">Đây là khối văn bản cơ bản với các lớp typography đẹp mắt của Tailwind. Bạn có thể chỉnh sửa nội dung này và thêm nhiều đoạn văn hơn.</p><p class="text-gray-600 leading-relaxed">Hoàn hảo để tạo nội dung văn bản phong phú với kiểu dáng nhất quán.</p></div>');
          console.log('✅ Text-basic block updated with Tailwind classes');
        }

        // Override quote block from preset webpage plugin
        const quoteBlock = blockManager.get('quote');
        if (quoteBlock) {
          quoteBlock.set('content', '<blockquote class="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-r-lg my-6"><p class="text-lg text-gray-700 italic leading-relaxed mb-2">"Đây là một trích dẫn được tạo kiểu đẹp mắt với các lớp Tailwind CSS."</p><cite class="text-sm text-gray-500 font-medium">— Tên Tác Giả</cite></blockquote>');
          console.log('✅ Quote block updated with Tailwind classes');
        }

        // Override link-block from preset webpage plugin
        const linkBlockPreset = blockManager.get('link-block');
        if (linkBlockPreset) {
          linkBlockPreset.set('content', '<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"><h3 class="text-xl font-bold mb-2">Kêu Gọi Hành Động</h3><p class="mb-4 opacity-90">Nhấp vào đây để tìm hiểu thêm về dịch vụ của chúng tôi</p><a href="#" class="inline-block bg-white text-blue-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300">Tìm Hiểu Thêm</a></div>');
          console.log('✅ Link-block updated with Tailwind classes');
        }
        
      } catch (error) {
        console.error('Error overriding basic blocks:', error);
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
          const device = deviceManager.get('desktop') || deviceManager.getAll().find(d => d.get('name') === 'Máy tính' || d.get('name') === 'Desktop');
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
          const device = deviceManager.get('tablet') || deviceManager.getAll().find(d => d.get('name') === 'Máy tính bảng' || d.get('name') === 'Tablet');
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
          const device = deviceManager.get('mobile') || deviceManager.getAll().find(d => d.get('name') === 'Điện thoại' || d.get('name') === 'Mobile');
          if (device) {
            deviceManager.select(device);
            console.log('Switched to mobile view');
          } else {
            console.warn('Mobile device not found');
          }
        }
      });
    },

    addFullscreenOverlay() {
      if (!this.editor || !this.editorRef) return;
      
      const editorContainer = this.editorRef;
      
      // Remove any existing overlay first
      const existingOverlay = editorContainer.querySelector('.grapejs-fullscreen-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      // Create fullscreen overlay
      const overlay = document.createElement('div');
      overlay.className = 'grapejs-fullscreen-overlay';
      overlay.innerHTML = `
        <div class="fullscreen-content">
          <div class="fullscreen-icon">⛶</div>
          <div class="fullscreen-text">Nhấp vào đây để chỉnh sửa trang toàn màn hình</div>
        </div>
      `;
      
      // Style the overlay
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      
      // Style the content inside
      const content = overlay.querySelector('.fullscreen-content');
      content.style.cssText = `
        text-align: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      `;
      
      // Style the icon
      const icon = overlay.querySelector('.fullscreen-icon');
      icon.style.cssText = `
        font-size: 48px;
        margin-bottom: 12px;
        animation: pulse 2s infinite;
      `;
      
      // Style the text
      const text = overlay.querySelector('.fullscreen-text');
      text.style.cssText = `
        font-size: 16px;
        font-weight: 500;
        opacity: 0.9;
      `;
      
      // Add pulse animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .grapejs-fullscreen-overlay:hover .fullscreen-content {
          transform: scale(1) !important;
        }
        .grapejs-fullscreen-overlay.show {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `;
      document.head.appendChild(style);
      
      // Position the editor container relatively if not already
      if (getComputedStyle(editorContainer).position === 'static') {
        editorContainer.style.position = 'relative';
      }
      
      // Add overlay to editor container
      editorContainer.appendChild(overlay);
      
      // Add hover event listeners
      editorContainer.addEventListener('mouseenter', () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          overlay.classList.add('show');
        }
      });
      
      editorContainer.addEventListener('mouseleave', () => {
        overlay.classList.remove('show');
      });
      
      // Add click event to enter fullscreen
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          // Use GrapesJS fullscreen command to ensure proper button state
          if (this.editor && this.editor.Commands) {
            this.editor.runCommand('fullscreen');
          } else {
            // Fallback to direct browser API
            if (editorContainer.requestFullscreen) {
              editorContainer.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
              });
            } else if (editorContainer.webkitRequestFullscreen) {
              editorContainer.webkitRequestFullscreen();
            } else if (editorContainer.msRequestFullscreen) {
              editorContainer.msRequestFullscreen();
            }
          }
        }
      });
      
      // Handle fullscreen change events
      const handleFullscreenChange = () => {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        
        if (isFullscreen) {
          // Hide overlay and adjust container styles for fullscreen
          overlay.classList.remove('show');
          overlay.style.visibility = 'hidden';
          overlay.style.pointerEvents = 'none';
          
          // Apply fullscreen styles
          editorContainer.style.width = '100vw';
          editorContainer.style.height = '100vh';
          editorContainer.style.position = 'fixed';
          editorContainer.style.top = '0';
          editorContainer.style.left = '0';
          editorContainer.style.zIndex = '9999';
          editorContainer.style.background = 'white';
        } else {
          // Reset container styles and re-enable overlay
          editorContainer.style.width = '';
          editorContainer.style.height = '800px';
          editorContainer.style.position = 'relative';
          editorContainer.style.top = '';
          editorContainer.style.left = '';
          editorContainer.style.zIndex = '';
          editorContainer.style.background = '';
          
          // Re-enable overlay
          overlay.style.visibility = 'visible';
          overlay.style.pointerEvents = 'auto';
          overlay.style.opacity = '0';
          overlay.classList.remove('show');
        }
      };
      
      // Listen for fullscreen changes
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
      
      console.log('✅ Fullscreen overlay with tooltip added successfully');
    },

    setupFullscreenCommand() {
      if (!this.editor) return;
      
      const editor = this.editor;
      const commands = editor.Commands;
      
      // Override or create the fullscreen command
      commands.add('fullscreen', {
        run: (editor, sender) => {
          const container = editor.getContainer();
          
          // Set the button as active
          if (sender && typeof sender.set === 'function') {
            sender.set('active', true);
          }
          
          // Enter fullscreen mode
          if (container.requestFullscreen) {
            container.requestFullscreen().catch(err => {
              console.error('Error entering fullscreen:', err);
            });
          } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
          } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
          }
          
          // Apply fullscreen styles
          container.style.width = '100vw';
          container.style.height = '100vh';
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0';
          container.style.zIndex = '9999';
          container.style.background = 'white';
          
          // Hide our custom overlay
          const overlay = container.querySelector('.grapejs-fullscreen-overlay');
          if (overlay) {
            overlay.style.display = 'none';
          }
          
          console.log('✅ Entered fullscreen via GrapesJS command');
        },
        
        stop: (editor, sender) => {
          const container = editor.getContainer();
          
          // Set the button as inactive
          if (sender && typeof sender.set === 'function') {
            sender.set('active', false);
          }
          
          // Exit fullscreen mode
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
              console.error('Error exiting fullscreen:', err);
            });
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          
          // Reset container styles
          container.style.width = '';
          container.style.height = '800px';
          container.style.position = 'relative';
          container.style.top = '';
          container.style.left = '';
          container.style.zIndex = '';
          container.style.background = '';
          
          // Show our custom overlay again
          const overlay = container.querySelector('.grapejs-fullscreen-overlay');
          if (overlay) {
            overlay.style.display = 'flex';
          }
          
          console.log('✅ Exited fullscreen via GrapesJS command');
        }
      });
      
      // Also handle fullscreen changes from browser events to sync the button state
      const handleFullscreenChange = () => {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        
        // Find the fullscreen button and sync its state
        const panels = editor.Panels;
        const optionsPanel = panels.getPanel('options');
        if (optionsPanel) {
          const buttons = optionsPanel.get('buttons');
          const fullscreenBtn = buttons.find(btn => 
            btn.get('command') === 'fullscreen' || 
            btn.get('id') === 'fullscreen' ||
            btn.get('className')?.includes('fa-expand')
          );
          
          if (fullscreenBtn) {
            fullscreenBtn.set('active', isFullscreen);
            console.log(`✅ Fullscreen button state synced: ${isFullscreen ? 'active' : 'inactive'}`);
          }
        }
        
        // Also handle our overlay visibility
        const container = editor.getContainer();
        const overlay = container.querySelector('.grapejs-fullscreen-overlay');
        if (overlay) {
          if (isFullscreen) {
            overlay.style.display = 'none';
          } else {
            overlay.style.display = 'flex';
            overlay.classList.remove('show'); // Reset hover state
          }
        }
      };
      
      // Listen for fullscreen changes to sync button state
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
      
      console.log('✅ GrapesJS fullscreen command integration setup complete');
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
          h('strong', {}, 'Lỗi: '),
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
          }, 'Tải Lại Trang')
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
        }, 'Đang tải trình chỉnh sửa trực quan...');
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
      }, 'Không có nội dung để xem trước');
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