module.exports = function(grunt){
'use strict';

grunt.initConfig({
    concat: {
        options: {

        },
        js: {
            src: ['src/scratch.js'],
            dest: 'build/scratch.debug.js'
        }
    },
    
    uglify: {
        options: {
            mangle: true,
            beautify: {
                ascii_only: true
            }
        },
        build: {
            files: {
                'build/scratch.js': ['build/scratch.debug.js']
            }
        }
    },

    bower: {
        install: {
            options: {
                install: true,
                copy: false,
            }
        }
    },

    jsdoc: {
        dist: {
            src: ['src/**/*.js', 'README.md'],
            options: {
                destination: 'docs',
                template : "bower_components/docs-template",
            }
        }
    },

    jsapi: {
        main: {

        }
    },

    jsdoc2md: {
        main: {
            src: "src/*.js",
            dest: "API.md"
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-bower-task');
grunt.loadNpmTasks('grunt-jsdoc');

grunt.registerTask('default', ['concat', 'uglify']);
grunt.registerTask('docs', ['bower', 'jsdoc']);

grunt.registerMultiTask('jsapi', 'Create markdown js api doc', function(){
    var jsdoc2mdDir = './bower_components/grunt-jsdoc-to-markdown/';
    grunt.task.loadTasks(jsdoc2mdDir + 'tasks');
    grunt.task.run('jsdoc2md');
});
grunt.registerTask('api', ['bower', 'jsapi']);

};