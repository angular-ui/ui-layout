'use strict';
module.exports = function (grunt) {

  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  // Task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['karma:continuous', 'dist', 'connect:continuous', 'build:gh-pages', 'watch']);
  grunt.registerTask('dist', ['ngmin', 'copy', 'uglify']);

  grunt.registerTask('karma:continuous', ['karma:wjqlite_bg', 'karma:wjquery_bg']);
  grunt.registerTask('karma:unit', ['karma:wjqlite:unit', 'karma:wjquery:unit']);
  grunt.registerTask('karma:unit:run', ['karma:wjqlite:unit:run', 'karma:wjquery:unit:run']);


  // HACK TO ACCESS TO THE COMPONENT-PUBLISHER
  function fakeTargetTask(prefix){
    return function(){

      if (this.args.length !== 1) return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');

      var done = this.async();
      var spawn = require('child_process').spawn;
      spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
        cwd : './node_modules/angular-ui-publisher',
        stdio: 'inherit'
      }).on('close', done);
    };
  }

  grunt.registerTask('build', fakeTargetTask('build'));
  grunt.registerTask('publish', fakeTargetTask('publish'));
  //


  // HACK TO MAKE TRAVIS WORK
  var testConfig = function (configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: [ 'Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };
  //


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
        base : 'out/built/gh-pages',
        open: true,
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
        files: ['src/*'],
        tasks: ['jshint:src', 'karma:unit:run', 'dist', 'build:gh-pages']
      },
      test: {
        files: ['test/*.spec.js'],
        tasks: ['jshint:test', 'karma:unit:run']
      },
      demo: {
        files: ['demo/**', 'publish.js'],
        tasks: ['build:gh-pages']
      },
      livereload: {
        files: ['out/built/gh-pages/**/*'],
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

    copy: {
      main: {
        files: [
          {src: ['src/ui-layout.css'], dest: 'dist/ui-layout.css', filter: 'isFile'}
        ]
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
