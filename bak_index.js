"use strict";

/**
 *  AEM Component Utility
 *
 * @author Drew Robinson (hello@drewrobinson.com)
 * @version 0.0.1
 * @desc Module provides scaffolding for AEM content, structure and navigation components.
 *
 * CL: node -e 'require("./index").util.scaffoldComponent(opts)'
 */

var copy    = require('recursive-copy');
var path    = require('path');
var through = require('through2');
var fs      = require('fs');

/**
 * Component Types
 * @type {{CONTENT: string, CONTAINER: string, NAVIGATION: string}}
 */
let types = {
    CONTENT: 'content',
    CONTAINER: 'container',
    NAVIGATION: 'navigation'
};

/**
 * Util
 * @type {{scaffoldComponent: util.scaffoldComponent}}
 * @TODO add support for container and navigation components
 */
var util = {
    scaffoldComponent: function(opts){

        if(!opts.project || !opts.type || !opts.name || !opts.dest){
            throw new Error('Cannot generate component without required args');
        }

        var fproject = opts.project.replace(/\s+/g, '-').toLowerCase();
        var fname = opts.name.replace(/\s+/g, '-').toLowerCase();
        var src, dest = opts.dest + fname;

        switch(opts.type.toLowerCase()){
            case types.CONTENT:
                src = __dirname + '/templates/content/';
                break;
            case types.CONTAINER:
                src = __dirname + '/templates/container/';//@TODO
                break;
            case types.NAVIGATION:
                src = __dirname + '/templates/navigation/';//@TODO
                break;
            default:;
        }

        var config = {
            overwrite: true,
            expand: true,
            dot: true,
            junk: true,
            filter: [
                '**/*',
                '!.htpasswd'
            ],
            rename: function(filePath) {
                if(filePath === 'component.html'){
                    filePath = filePath.replace(/component/g, fname);
                }
                return filePath;
            },
            transform: function(src, dest, stats) {
                if (path.extname(src) !== '.xml') { return null; }
                return through(function(chunk, enc, done)  {
                    var output = chunk.toString().replace(/%fname/g, fname).replace(/%fproject/g, fproject);
                    done(null, output);
                });
            }
        };

        try{
            copy(src, dest, config)
                .on(copy.events.COPY_FILE_START, function(copyOperation) {
                    console.info('Copying file ' + copyOperation.src + '...');
                })
                .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
                    console.info('Copied to ' + copyOperation.dest);
                })
                .on(copy.events.ERROR, function(error, copyOperation) {
                    console.error('Unable to copy ' + copyOperation.dest);
                })
                .then(function(results) {
                    console.info(results.length + ' file(s) copied');
                })
                .catch(function(error) {
                    return console.error('Copy failed: ' + error);
                });

        }catch(e){
            console.log('error: ', e);
        }
    }
};


module.exports = {
    util: util
};