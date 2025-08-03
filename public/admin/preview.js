// Preview templates for DecapCMS Page Builder components

// Utility function to create React elements (h is provided by DecapCMS)
const { h } = window;

// Hero Section Preview
const HeroPreview = ({ entry }) => {
  const data = entry.getIn(['data']).toJS();
  const block = data;
  
  return h('section', {
    className: 'hero-section',
    style: {
      backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      color: 'white',
      textAlign: block.textAlign || 'center'
    }
  }, [
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }
    }),
    h('div', {
      style: {
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '5rem 1rem',
        width: '100%'
      }
    }, [
      h('div', {
        style: { maxWidth: '56rem', margin: '0 auto' }
      }, [
        h('h1', {
          style: { 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }
        }, block.title || 'Hero Title'),
        block.subtitle && h('p', {
          style: { 
            fontSize: '1.5rem', 
            marginBottom: '2rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }
        }, block.subtitle),
        block.ctaText && h('a', {
          href: block.ctaLink || '#',
          style: {
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: 'bold',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '1.1rem',
            transition: 'background-color 0.3s'
          }
        }, block.ctaText)
      ])
    ])
  ]);
};

// Content Section Preview
const ContentPreview = ({ entry }) => {
  const data = entry.getIn(['data']).toJS();
  const block = data;
  
  return h('section', {
    style: {
      padding: '4rem 1rem',
      backgroundColor: block.backgroundColor || 'white'
    }
  }, [
    h('div', {
      style: { maxWidth: '1200px', margin: '0 auto' }
    }, [
      block.title && h('h2', {
        style: { 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '2rem', 
          textAlign: 'center',
          color: block.textColor || '#1f2937'
        }
      }, block.title),
      h('div', {
        style: { 
          maxWidth: block.layout === 'single' ? '56rem' : '100%', 
          margin: '0 auto',
          lineHeight: '1.7',
          fontSize: '1.1rem',
          color: '#374151'
        },
        dangerouslySetInnerHTML: { __html: block.content || 'Content goes here...' }
      })
    ])
  ]);
};

// Features Section Preview
const FeaturesPreview = ({ entry }) => {
  const data = entry.getIn(['data']).toJS();
  const block = data;
  const columns = block.columns || 3;
  
  return h('section', {
    style: {
      padding: '4rem 1rem',
      backgroundColor: block.backgroundColor || '#f9fafb'
    }
  }, [
    h('div', {
      style: { maxWidth: '1200px', margin: '0 auto' }
    }, [
      block.title && h('h2', {
        style: { 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '3rem', 
          textAlign: 'center',
          color: '#1f2937'
        }
      }, block.title),
      h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`,
          gap: '2rem'
        }
      }, (block.items || [
        { title: 'Feature 1', description: 'Feature description goes here' },
        { title: 'Feature 2', description: 'Feature description goes here' },
        { title: 'Feature 3', description: 'Feature description goes here' }
      ]).map((item, index) =>
        h('div', {
          key: index,
          style: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center',
            transition: 'transform 0.3s'
          }
        }, [
          item.image && h('img', {
            src: item.image,
            alt: item.title,
            style: {
              width: '100%',
              height: '12rem',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }
          }),
          h('h3', {
            style: { 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#1f2937'
            }
          }, item.title),
          h('p', {
            style: { 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }
          }, item.description),
          item.link && h('a', {
            href: item.link,
            style: { 
              color: '#2563eb', 
              fontWeight: '500', 
              textDecoration: 'none',
              fontSize: '1rem'
            }
          }, 'Learn More →')
        ])
      ))
    ])
  ]);
};

// CTA Section Preview
const CTAPreview = ({ entry }) => {
  const data = entry.getIn(['data']).toJS();
  const block = data;
  
  return h('section', {
    style: {
      padding: '5rem 1rem',
      backgroundColor: block.backgroundColor || '#1e40af',
      textAlign: 'center',
      color: block.textColor || 'white'
    }
  }, [
    h('div', {
      style: { maxWidth: '1200px', margin: '0 auto' }
    }, [
      block.title && h('h2', {
        style: { 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          lineHeight: '1.2'
        }
      }, block.title),
      block.subtitle && h('p', {
        style: { 
          fontSize: '1.25rem', 
          marginBottom: '2.5rem', 
          opacity: 0.9,
          maxWidth: '42rem',
          margin: '0 auto 2.5rem auto'
        }
      }, block.subtitle),
      block.buttonText && h('a', {
        href: block.buttonLink || '#',
        style: {
          display: 'inline-block',
          backgroundColor: 'white',
          color: block.backgroundColor || '#1e40af',
          fontWeight: 'bold',
          padding: '1rem 2.5rem',
          borderRadius: '0.75rem',
          textDecoration: 'none',
          fontSize: '1.1rem',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)'
        }
      }, block.buttonText)
    ])
  ]);
};

// Testimonials Preview
const TestimonialsPreview = ({ entry }) => {
  const data = entry.getIn(['data']).toJS();
  const block = data;
  
  return h('section', {
    style: {
      padding: '4rem 1rem',
      backgroundColor: '#f9fafb'
    }
  }, [
    h('div', {
      style: { maxWidth: '1200px', margin: '0 auto' }
    }, [
      block.title && h('h2', {
        style: { 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '3rem', 
          textAlign: 'center',
          color: '#1f2937'
        }
      }, block.title),
      h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: block.layout === 'single' ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }
      }, (block.testimonials || [
        { name: 'John Doe', content: 'Great service!', rating: 5 }
      ]).map((testimonial, index) =>
        h('div', {
          key: index,
          style: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }
        }, [
          testimonial.rating && h('div', {
            style: { display: 'flex', marginBottom: '1rem' }
          }, Array.from({length: 5}, (_, i) =>
            h('span', {
              key: i,
              style: { 
                color: i < testimonial.rating ? '#fbbf24' : '#d1d5db',
                fontSize: '1.25rem'
              }
            }, '★')
          )),
          h('blockquote', {
            style: { 
              fontSize: '1.1rem',
              fontStyle: 'italic', 
              marginBottom: '1.5rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }
          }, `"${testimonial.content}"`),
          h('div', {
            style: { display: 'flex', alignItems: 'center' }
          }, [
            testimonial.avatar && h('img', {
              src: testimonial.avatar,
              alt: testimonial.name,
              style: {
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                marginRight: '1rem',
                objectFit: 'cover'
              }
            }),
            h('div', {}, [
              h('div', {
                style: { fontWeight: '600', color: '#1f2937' }
              }, testimonial.name),
              (testimonial.title || testimonial.company) && h('div', {
                style: { fontSize: '0.875rem', color: '#6b7280' }
              }, [testimonial.title, testimonial.company].filter(Boolean).join(' at '))
            ])
          ])
        ])
      ))
    ])
  ]);
};

// Page Builder Preview - combines all blocks
const PageBuilderPreview = ({ entry, widgetFor, widgetsFor }) => {
  const data = entry.getIn(['data']).toJS();
  const blocks = data.blocks || [];
  
  return h('div', { className: 'page-builder-preview' }, [
    h('div', {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '1rem',
        borderBottom: '2px solid #374151'
      }
    }, [
      h('h1', {
        style: {
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }
      }, `📄 ${data.title || 'Landing Page Preview'}`),
      h('p', {
        style: {
          margin: '0.5rem 0 0 0',
          opacity: 0.8,
          fontSize: '0.875rem'
        }
      }, `${blocks.length} blocks • ${data.description || 'No description'}`)
    ]),
    blocks.length === 0 && h('div', {
      style: {
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        color: '#6b7280'
      }
    }, [
      h('h3', { style: { fontSize: '1.5rem', marginBottom: '1rem' }}, '📝 No blocks added yet'),
      h('p', {}, 'Start building your page by adding blocks from the editor!')
    ]),
    ...blocks.map((block, index) => {
      const blockEntry = { getIn: () => ({ toJS: () => block }) };
      
      switch (block.type) {
        case 'hero':
          return h(HeroPreview, { key: index, entry: blockEntry });
        case 'content':
          return h(ContentPreview, { key: index, entry: blockEntry });
        case 'features':
          return h(FeaturesPreview, { key: index, entry: blockEntry });
        case 'cta':
          return h(CTAPreview, { key: index, entry: blockEntry });
        case 'testimonials':
          return h(TestimonialsPreview, { key: index, entry: blockEntry });
        case 'gallery':
          return h('div', {
            key: index,
            style: {
              padding: '2rem',
              backgroundColor: '#fef3c7',
              border: '2px dashed #f59e0b',
              margin: '1rem 0',
              textAlign: 'center',
              borderRadius: '0.5rem'
            }
          }, `🖼️ Image Gallery component (${(block.images || []).length} images)`);
        default:
          return h('div', {
            key: index,
            style: {
              padding: '2rem',
              backgroundColor: '#fee2e2',
              border: '2px dashed #ef4444',
              margin: '1rem 0',
              textAlign: 'center',
              borderRadius: '0.5rem'
            }
          }, `❓ Unknown component type: ${block.type}`);
      }
    })
  ]);
};

// Wait for CMS to be ready, then register preview templates
if (typeof CMS !== 'undefined') {
  CMS.registerPreviewTemplate('landing', PageBuilderPreview);
} else {
  // If CMS is not immediately available, wait for it
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof CMS !== 'undefined') {
      CMS.registerPreviewTemplate('landing', PageBuilderPreview);
    }
  });
}
