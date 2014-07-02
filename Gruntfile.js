// Generated on 2014-05-26 using generator-mobile 1.0.0-alpha.1
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var yeomanConfig = {
    app : 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman           : yeomanConfig,
    // TODO: Make this conditional
    watch            : {
      coffee    : {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['coffee:test']
      },
      compass   : {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      // jshint: {
      //     files: ['<%= jshint.files %>'],
      //     tasks: ['jshint'],
      //     options: {
      //         livereload: LIVERELOAD_PORT
      //     }
      // },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files  : [
          '<%= yeoman.app %>/{,*/}*.html', '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js', 'test/spec/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    autoshot         : {
      dist: {
        options: {
          path    : '<%= yeoman.app %>/../screenshots/',
          remote  : {
            files: [
              { src: 'http://localhost:<%= connect.options.port %>', dest: 'app.jpg'}
            ]
          },
          viewport: ['320x480', '480x320', '384x640', '640x384', '602x963', '963x602', '600x960', '960x600', '800x1280',
            '1280x800', '768x1024', '1024x768']
        }
      }
    },
    responsive_images: {
      dev: {
        options: {
          engine: 'im', // brew install ImageMagick
          sizes : [
            {
              width: 320
            },
            {
              width: 640
            },
            {
              width: 1024
            }
          ]
        },
        files  : [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/images',
            src   : '{,*/}*.{png,jpg,jpeg}',
            dest  : '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    connect          : {
      options   : {
        port    : 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              lrSnippet, mountFolder(connect, '.tmp'), mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test      : {
        options: {
          middleware: function(connect) {
            return [
              lrSnippet, mountFolder(connect, '.tmp'), mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist      : {
        options: {
          middleware: function(connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open             : {
      server : {
        path: 'http://localhost:<%= connect.options.port %>'
      },
      test   : {
        path: 'http://localhost:<%= connect.options.port %>'
      },
      nexus4 : {
        path: 'http://www.browserstack.com/start#os=android&os_version=4.2&device=LG+Nexus+4&speed=1&start=true&url=http://rnikitin.github.io/examples/jumbotron/'
      },
      nexus7 : {
        path: 'http://www.browserstack.com/start#os=android&os_version=4.1&device=Google+Nexus+7&speed=1&start=true&url=http://rnikitin.github.io/examples/jumbotron/'
      },
      iphone5: {
        path: 'http://www.browserstack.com/start#os=ios&os_version=6.0&device=iPhone+5&speed=1&start=true&url=http://rnikitin.github.io/examples/jumbotron/'
      }
    },
    clean            : {
      dist       : {
        files: [
          {
            dot: true,
            src: [
              '.tmp', '<%= yeoman.dist %>/*', '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server     : '.tmp',
      screenshots: 'screenshots'
    },
    browser_sync     : {
      dev: {
        bsFiles: {
          src: '<%= yeoman.app %>/styles/style.css'
        },
        options: {
          watchTask: false,
          debugInfo: true,
          // Change to 0.0.0.0 to access externally
          host     : 'http://localhost:<%= connect.options.port %>',
          server   : {
            baseDir: '<%= yeoman.app %>'
          },
          ghostMode: {
            clicks: true,
            scroll: true,
            links : true,
            forms : true
          }
        }
      }
    },
    jshint           : {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      files  : [
        '<%= yeoman.app %>/scripts/{,*/}*.js', '!<%= yeoman.app %>/scripts/libs/ajax.js',
        '!<%= yeoman.app %>/scripts/vendor/*'
        //'test/spec/{,*/}*.js'
      ]
    },
    mocha            : {
      all: {
        options: {
          run : true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    coffee           : {
      dist: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/scripts',
            src   : '{,*/}*.coffee',
            dest  : '.tmp/scripts',
            ext   : '.js'
          }
        ]
      },
      test: {
        files: [
          {
            expand: true,
            cwd   : 'test/spec',
            src   : '{,*/}*.coffee',
            dest  : '.tmp/spec',
            ext   : '.js'
          }
        ]
      }
    },
    compass          : {
      options: {
        sassDir                : '<%= yeoman.app %>/styles',
        cssDir                 : '.tmp/styles',
        spriteLoadPath         : '<%= yeoman.app %>/sprites',
        generatedImagesDir     : '.tmp/images/gen',
        imagesDir              : '<%= yeoman.app %>/images',
        javascriptsDir         : '<%= yeoman.app %>/scripts',
        /*fontsDir: '<%= yeoman.app %>/styles/fonts',*/
        importPath             : '<%= yeoman.app %>/bower_components',
        httpImagesPath         : '/images',
        httpGeneratedImagesPath: '/images/gen',
        httpFontsPath          : '/styles/fonts',
        relativeAssets         : false
      },
      dist   : {},
      server : {
        options: {
          debugInfo: true
        }
      }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
     dist: {}
     },*/
    requirejs        : {
      dist: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          // `name` and `out` is set by grunt-usemin
          baseUrl                : yeomanConfig.app + '/scripts',
          optimize               : 'none',
          // TODO: Figure out how to make sourcemaps work with grunt-usemin
          // https://github.com/yeoman/grunt-usemin/issues/30
          //generateSourceMaps: true,
          // required to support SourceMaps
          // http://requirejs.org/docs/errors.html#sourcemapcomments
          preserveLicenseComments: false,
          useStrict              : true,
          wrap                   : true
          //uglify2: {} // https://github.com/mishoo/UglifyJS2
        }
      }
    },
    rev              : {
      options: {
        algorithm: 'md5',
        length   : 6
      },
      dist   : {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js', '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}', '!<%= yeoman.dist %>/images/no-hash/*.*', // no-hash 中的图片不打包，不会变的图片
            '!<%= yeoman.dist %>/images/sprites/*.*', // 自动生成的 sprites 已经加 hash 了
            '<%= yeoman.dist %>/styles/fonts/*', '<%= yeoman.dist %>/*.{ico,png}'
          ]
        }
      }
    },
    useminPrepare    : {
      options: {
        dest: '<%= yeoman.dist %>'
      },
      html   : '<%= yeoman.app %>/*.html'
    },
    usemin           : {
      options: {
        dirs: ['<%= yeoman.dist %>']
      },
      html   : ['<%= yeoman.dist %>/*.html'],
      css    : ['<%= yeoman.dist %>/styles/{,*/}*.css']
    },
    imagemin         : {
      dist: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/images',
            src   : ['{,*/}*.{png,jpg,jpeg}', '!archive/*.*'],
            dest  : '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    svgmin           : {
      dist: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/images',
            src   : '{,*/}*.svg',
            dest  : '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    cssmin           : {
      options: {
        keepSpecialComments: 0 // remove all comment
      },
      dist   : {
        files: {
          '<%= yeoman.dist %>/styles/main.css': [
            '.tmp/styles/*.css'
            // '!.tmp/styles/base.css' // 不打包 base.css，让所有文件都可以共用它
            //'<%= yeoman.app %>/styles/{,*/}*.css' // 这里都是 scss，没有css；另外如果有的话会很乱吧
          ]
        }
      }
    },
    htmlmin          : {
      dist: {
        options: {
          removeComments    : true,
          collapseWhitespace: true
          /*removeCommentsFromCDATA: true,
           // https://github.com/yeoman/grunt-usemin/issues/44
           //collapseWhitespace: true,
           collapseBooleanAttributes: true,
           removeAttributeQuotes: true,
           removeRedundantAttributes: true,
           useShortDoctype: true,
           removeEmptyAttributes: true,
           removeOptionalTags: true*/
        },
        files  : [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>',
            src   : '*.html',
            dest  : '<%= yeoman.dist %>'
          }
        ]
      }
    },
    webp             : {
      files  : {
        expand: true,
        cwd   : '<%= yeoman.app %>/images',
        src   : '{,*/}*.png',
        dest  : '<%= yeoman.dist %>/images'
      },
      options: {
        preset           : 'icon', // default, photo, picture, drawing, icon, text
        verbose          : true,
        quality          : 80,
        alphaQuality     : 80,
        compressionMethod: 6,
        segments         : 4,
        psnr             : 42,
        sns              : 50,
        filterStrength   : 40,
        filterSharpness  : 3,
        simpleFilter     : true,
        partitionLimit   : 50,
        analysisPass     : 6,
        multiThreading   : true,
        lowMemory        : false,
        alphaMethod      : 0,
        alphaFilter      : 'best',
        alphaCleanup     : true,
        noAlpha          : false,
        lossless         : false
      }
    },
    // Put files not handled in other tasks here
    copy             : {
      dist: {
        files: [
          {
            expand: true,
            dot   : true,
            cwd   : '<%= yeoman.app %>',
            dest  : '<%= yeoman.dist %>',
            src   : [
              '*.{ico,png,txt}', '.htaccess', 'images/{,*/}*.{webp,gif}', 'styles/fonts/*'
            ]
          },
          {
            expand: true,
            cwd   : '.tmp/images',
            dest  : '<%= yeoman.dist %>/images',
            src   : [
              'gen/*', 'sprites/*'
            ]
          },
          {
            expand: true,
            src   : ['asset_test/{,*/}*.*'],
            cwd   : '<%= yeoman.app %>',
            dest  : '<%= yeoman.dist %>'
          }
        ]
      },

      disttest: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>',
            src   : 'scripts/**',
            dest  : '<%= yeoman.dist %>'
          }
        ]
      },

      test: {
        files: [
          {
            expand: true,
            cwd   : '<%= yeoman.app %>/scripts',
            src   : '**',
            dest  : '.tmp/spec'
          },
          {
            expand: true,
            cwd   : '<%= yeoman.app %>',
            src   : 'bower_components/requirejs/require.js',
            dest  : '.tmp'
          }
        ]
      }
    },

    manifest: {
      generate: {
        options: {
          basePath    : 'dist/',
          //cache: ['scripts/*.js', 'styles/*.css'],
          network     : ['*'],
          // fallback: ['/ /offline.html'],
          // exclude: ['views/*', '*.html'],
          preferOnline: true,
          verbose     : false,
          timestamp   : true,
          hash        : true,
          master      : ['index.html']
        },
        src    : [
          'scripts/*.js', 'styles/*.css', 'bower_components/*/*.*', 'images/{,*/}*.png', '!images/stars/*.png',
          '!images/archive/*.png', '*.{png,ico}'
        ],
        dest   : 'dist/manifest.appcache'
      }
    },


    autoprefixer: {
      options: {
        browsers: ['ie >= 10', 'ff >= 30', 'android >= 2.3', 'chrome >= 23', 'ios > 4']
      },
      dist   : {
        files: [
          {
            expand: true,
            cwd   : '.tmp/styles/',
            src   : '{,*/}*.css',
            dest  : '.tmp/styles/'
          }
        ]
      }
    },

    concurrent: {
      server: [
        'coffee:dist', 'compass:server'
      ],
      test  : [
        'coffee', 'compass'
      ],
      dist  : [
        'coffee', 'compass:dist', 'imagemin', 'svgmin', 'htmlmin'
      ]
    },
    bower     : {
      options: {
        exclude: ['modernizr']
      },
      all    : {
        rjsConfig: '<%= yeoman.app %>/scripts/main.js'
      }
    }
  });

  grunt.registerTask('server', function(target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server', 'concurrent:server', 'autoprefixer', 'connect:livereload', 'open:server', 'watch'
    ]);
  });

  grunt.registerTask('test', function(target) {
    var tasks = [
      'clean:server', 'copy:test', 'concurrent:test', 'autoprefixer', 'connect:test'
    ];
    if (target === 'build') {   // 命令行上查看结果
      tasks.push('mocha');
    } else {    // 浏览器上查看结果
      //tasks.push('open:server');
      tasks.push('watch');
    }
    grunt.task.run(tasks);
  });

  grunt.registerTask('build', [
    'clean:dist', 'useminPrepare', 'concurrent:dist', 'autoprefixer', 'requirejs', 'cssmin', //'responsive_images:dev',
    'concat', 'uglify', 'copy:dist', 'rev', 'usemin', 'manifest'
    //'autoshot'
  ]);

  grunt.registerTask('default', [
    'jshint', 'test:build', 'build'
  ]);

  grunt.registerTask('screenshots', [
    'clean:server', 'clean:screenshots', 'concurrent:server', 'connect:livereload', 'autoshot'
  ]);

};
