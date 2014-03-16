/*global module: true */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/node/*.js', '!src/node/bundle.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          console: true,
          module: true,
          document: true
        }
      }
    },
    copy: {
      main: {
        files: [
            {expand: true,
             src: ['src/_locales',
                   'src/css',
                   'src/img',
                   'src/node',
                   'background.js',
                   'index.html',
                   'manifest.json',
                   'production-launch.js'],
             dest: 'dist/'
            }
        ]
      }
    },
    
    replace: {
      html: {
        src: ['dist/index.html'],
        dest: 'dist/index.html',
        replacements: [{
          from: '<!--start PROD imports',
          to: '<!--start PROD imports-->'
        },{
          from: 'end PROD imports-->',
          to: '<!--end PROD imports-->'
        },{
          from: '<!--start DEV imports-->',
          to: '<!--start DEV imports'
        },{
          from: '<!--end DEV imports-->',
          to: 'end DEV imports-->'
        },{
          from: '/* Development Code Only! */',
          to: '/* Development Code Only!'
        },{
          from: '/* End Development Code */',
          to: 'End Development Code */'
        }]
      }
    }

  });
    
grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-closure-compiler');
      grunt.loadNpmTasks('grunt-text-replace');


  grunt.registerTask('default', ['jshint',
                                 'copy']);
};
