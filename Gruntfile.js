module.exports = function(grunt) {
  grunt.initConfig({
    builddir: ".",
    pkg: grunt.file.readJSON('package.json'),
    less: {
      development: {
        files: {
          "css/wercker.css": "less/wercker.less"
        }
      },
    },
    watch: {
      less: {
        files: 'less/*.less',
        tasks: 'less',
      }
    },
    uglify: {
      options: {
        preserveComments: false,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      my_target: {
        files: {
          'olwiz.min.js': ['olwiz.js']
        }
      }
    },
    mocha: {
      test: {
        options: {
          run: true
        },
        src: ['test/**/*.html'],
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('prod', ['uglify', 'less']);
  grunt.registerTask('test', ['mocha']);
};
