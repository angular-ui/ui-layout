module.exports = function (grunt) {
  'use strict';

  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  // Task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['connect:continuous', 'karma:continuous', 'watch']);
  grunt.registerTask('dist', ['ngmin', 'uglify']);


  var testConfig = function (configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: [ 'Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mainFileName: 'ui-layout',
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n')
    },

    connect: {
      options: {
        port: grunt.option('port') || '8000',
        hostname: grunt.option('host') || 'localhost',
        open: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/demo',
        livereload: true
      },
      server: { options: { keepalive: true } },
      continuous: { options: { keepalive: false } }
    },

    // TESTER
    // =======
    karma: {
      unit: testConfig('test/karma.conf.js'),
      server: {configFile: 'test/karma.conf.js'},
      continuous: {configFile: 'test/karma.conf.js', background: true }
    },


    // WATCHER
    // =======
    watch: {
      src: {
        files: ['src/*'],
        tasks: ['jshint', 'karma:unit:run', 'dist'],
        options: { livereload: true }
      },
      test: {
        files: ['test/*.js'],
        tasks: ['jshint', 'karma:unit:run']
      },
      demo: {
        files: ['demo/*', '<%= mainFileName %>.js'],
        tasks: ['uglify'],
        options: { livereload: true }
      }
    },


    // CODE QUALITY
    // ============
    jshint: {
      all: ['src/*.js', 'gruntFile.js', 'test/*.js', 'demo/*.js'],
      options: { jshintrc: '.jshintrc' }
    },

    // MINIFIER
    // ========
    uglify: {
      options: {banner: '<%= meta.banner %>'},
      build: {
        expand: true,
        cwd: 'dist',
        src: ['*.js'],
        ext: '.min.js',
        dest: 'dist'
      }
    },

    // NGMIN
    // =====
    ngmin: {
      main: {
        expand: true,
        cwd: 'src',
        src: ['*.js'],
        dest: 'dist'
      }
    },

    // CHANGELOG
    // =========
    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    }
  });

};
