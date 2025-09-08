// Device Commands Fix - Load this after GrapesJS widget
(function() {
  'use strict';
  
  // Wait for the CMS to be available and widget to be registered
  if (typeof window.CMS !== 'undefined') {
    // Add device command fix after a short delay to ensure editor is ready
    setTimeout(() => {
      console.log('Applying device commands fix...');
      
      // Find the GrapesJS editor instance
      const editorElements = document.querySelectorAll('[id^="gjs-editor-"]');
      
      editorElements.forEach(element => {
        if (window.grapesjs && window.grapesjs.editors) {
          window.grapesjs.editors.forEach(editor => {
            if (editor.getContainer().includes(element.id.replace('#', ''))) {
              
              const deviceManager = editor.DeviceManager;
              const commands = editor.Commands;
              
              // Add missing tablet device if it doesn't exist
              if (!deviceManager.get('tablet')) {
                deviceManager.add({
                  id: 'tablet',
                  name: 'Tablet',
                  width: '768px',
                  widthMedia: '992px'
                });
              }
              
              // Fix device commands
              commands.add('set-device-desktop', {
                run: (editor) => {
                  const device = deviceManager.get('desktop') || deviceManager.getAll().find(d => d.get('name') === 'Desktop');
                  if (device) {
                    deviceManager.select(device);
                    console.log('Switched to desktop view');
                  }
                }
              });

              commands.add('set-device-tablet', {
                run: (editor) => {
                  const device = deviceManager.get('tablet') || deviceManager.getAll().find(d => d.get('name') === 'Tablet');
                  if (device) {
                    deviceManager.select(device);
                    console.log('Switched to tablet view');
                  }
                }
              });

              commands.add('set-device-mobile', {
                run: (editor) => {
                  const device = deviceManager.get('mobile') || deviceManager.getAll().find(d => d.get('name') === 'Mobile');
                  if (device) {
                    deviceManager.select(device);
                    console.log('Switched to mobile view');
                  }
                }
              });
              
              console.log('Device commands fixed for editor:', element.id);
            }
          });
        }
      });
    }, 2000);
  }
})();
