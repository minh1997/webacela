// Summernote Widget for Decap CMS
(function() {
  'use strict';

  // Load required dependencies
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Custom Summernote Control
  const SummernoteControl = createClass({
    getInitialState() {
      return { 
        value: this.props.value || '',
        loaded: false
      };
    },

    async componentDidMount() {
      try {
        // Load CSS
        loadStylesheet('https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css');
        
        // Load jQuery if not present
        if (!window.jQuery) {
          await loadScript('https://code.jquery.com/jquery-3.4.1.slim.min.js');
        }

        // Load Summernote
        if (!window.jQuery.fn.summernote) {
          await loadScript('https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js');
        }

        this.setState({ loaded: true }, () => {
          this.initSummernote();
        });
      } catch (error) {
        console.error('Failed to load Summernote:', error);
      }
    },

    initSummernote() {
      if (!this.editorRef || !window.jQuery) return;

      const { onChange } = this.props;
      const { value } = this.state;

      window.jQuery(this.editorRef).summernote({
        height: 300,
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture', 'video']],
          ['view', ['fullscreen', 'codeview', 'help']]
        ],
        callbacks: {
          onChange: (contents, $editable) => {
            this.setState({ value: contents });
            onChange(contents);
          },
          onInit: () => {
            if (value) {
              window.jQuery(this.editorRef).summernote('code', value);
            }
          }
        }
      });
    },

    componentWillUnmount() {
      if (this.editorRef && window.jQuery && window.jQuery.fn.summernote) {
        window.jQuery(this.editorRef).summernote('destroy');
      }
    },

    componentDidUpdate(prevProps) {
      if (prevProps.value !== this.props.value && this.editorRef && window.jQuery) {
        const currentContent = window.jQuery(this.editorRef).summernote('code');
        if (currentContent !== this.props.value) {
          window.jQuery(this.editorRef).summernote('code', this.props.value || '');
        }
      }
    },

    render() {
      const { loaded } = this.state;
      
      if (!loaded) {
        return h('div', { className: 'summernote-loading' }, 'Loading rich text editor...');
      }

      return h('div', { className: 'summernote-wrapper' },
        h('div', {
          ref: ref => { this.editorRef = ref; },
          style: { minHeight: '300px' }
        })
      );
    }
  });

  // Preview component
  const SummernotePreview = ({ value }) => {
    return h('div', {
      className: 'summernote-preview',
      dangerouslySetInnerHTML: { __html: value || '' }
    });
  };

  // Register the widget
  if (window.CMS) {
    CMS.registerWidget('summernote', SummernoteControl, SummernotePreview);
  }

})();
