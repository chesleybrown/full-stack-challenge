'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		tabs4life: {
			app: {
				options: {
					jshint: {
						mocha: true
					}
				},
				src: [
					'*.json',
					'.gitignore',
					'Gruntfile.js',
					'Procfile',
					'README.md',
					'src/**/*.html',
					'src/**/*.js',
					'test/**/*.js'
				]
			}
		}
	});
	
	grunt.registerTask('test', ['tabs4life:app']);
	grunt.registerTask('default', ['test']);
};
