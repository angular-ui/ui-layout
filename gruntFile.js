'use strict';
module.exports = function (grunt) {

  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  // Task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['connect:continuous', 'karma:continuous', 'watch']);
  grunt.registerTask('dist', ['ngmin', 'uglify']);

  grunt.registerTask('karma:continuous', ['karma:wjqlite_bg', 'karma:wjquery_bg']);
  grunt.registerTask('karma:unit', ['karma:wjqlite:unit', 'karma:wjquery:unit']);
  grunt.registerTask('karma:unit:run', ['karma:wjqlite:unit:run', 'karma:wjquery:unit:run']);

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
      wjquery: testConfig('test/karma-jquery.conf.js'),
      wjqlite: testConfig('test/karma-jqlite.conf.js'),
      wjquery_bg: {configFile: 'test/karma-jquery.conf.js', background: true },
      wjqlite_bg: {configFile: 'test/karma-jqlite.conf.js', background: true }
    },


    // WATCHER
    // =======
    watch: {
      src: {
        files: ['src/*', 'demo/**/*.js'],
        tasks: ['jshint:src', 'karma:unit:run', 'dist']
      },
      test: {
        files: ['test/*.spec.js'],
        tasks: ['jshint:test', 'karma:unit:run']
      },
      demo: {
        files: ['demo/*', 'src/*'],
        options: { livereload: true }
      }
    },


    // CODE QUALITY
    // ============
    jshint: {
      src: {
        files:{ src : ['src/*.js', 'demo/**/*.js'] },
        options: { jshintrc: '.jshintrc' }
      },
      test: {
        files:{ src : [ 'test/*.spec.js' ] },
        options: grunt.util._.extend({}, grunt.file.readJSON('.jshintrc'), {
          node: true,
          globals: {
            angular: false,
            inject: false,
            _jQuery: false,

            jasmine: false,
            afterEach: false,
            beforeEach: false,
            ddescribe: false,
            describe: false,
            expect: false,
            iit: false,
            it: false,
            spyOn: false,
            xdescribe: false,
            xit: false
          }
        })
      }
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
