/*global module: true */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: [
        'dist',
        '*.zip'
      ]
    },
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
      srcfiles: {
        files: [
            {expand: true,
             nonull: true,
             cwd: 'src',
             src: ['_locales/**',
                   'css/**',
                   'img/**',
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
    },

    'closure-compiler': {
    frontend: {
      js: ['src/js/*.js', 'src/js/ui/*.js', 'src/js/service/*.js',
           'src/closure-library/closure/goog/base.js',
           '!src/js/ui/*_test.js'],
      jsOutputFile: 'dist/production.js',
      maxBuffer: 500,
      options: {
        //compilation_level: 'ADVANCED_OPTIMIZATIONS',
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        //compilation_level: 'WHITESPACE_ONLY',
        language_in: 'ECMASCRIPT5_STRICT'
      }
    }
  },
      
  browserify: {
    dist: {
      files: {
        'dist/node/bundle.js': ['src/node/index.js']
      }
    }
  },

  compress: {
      main: {
        options: {
          archive: 'archive.zip'
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['**'], dest: './'}
        ]
      }
  }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('default', ['jshint', 'clean', 'copy', 'replace',
                                 'closure-compiler', 'browserify', 'compress']);
};
