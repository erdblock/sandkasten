/* @flow */

var marked = require('marked');
var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
	return '<h'
		+ level
		+ ' class="h'
		+ (level+1)
		+ '">'
		+ text
		+ '</h'
		+ level
		+ '>';
}

marked.setOptions({
	renderer: renderer,
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});

module.exports = marked;
