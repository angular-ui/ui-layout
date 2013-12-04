module.exports = function (grunt) {
  'use strict';

  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  // Task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['connect:continuous', 'karma:continuous', 'watch']);
  grunt.registerTask('build-doc', ['uglify', 'copy']);


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
      test: {
        files: ['<%= mainFileName %>.js', 'test/*.js'],
        tasks: ['jshint', 'karma:unit:run']
      },
      demo: {
        files: ['demo/*', '<%= mainFileName %>.js'],
        tasks: ['uglify']
      }
    },


    // CODE QUALITY
    // ============
    jshint: {
      all: ['<%= mainFileName %>.js', 'gruntFile.js', 'test/*.js', 'demo/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {}
      }
    },

    // MINIFIER
    // ========
    uglify: {
      //options: {banner: '<%= meta.banner %>'},
      build: {
        files: {
          'dist/<%= mainFile %>.min.js': ['<%= mainFile %>.js']
        }
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
