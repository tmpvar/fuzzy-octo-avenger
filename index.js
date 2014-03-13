var Client = require('irc').Client;
var through = require('through');
var split = require('split');
var argv = require('optimist').argv;
var blessed = require('blessed');
var screen = blessed.screen();





// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  bottom: 0,
  left: 'center',
  width: '90%',
  height: '9%',
  content: '> ',
  grabKeys : true,
  border: {
    type: 'line'
  },
  style: {
    fg: '',
    bg: '#111125',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});

var box2 = blessed.box({
  top: 0,
  left: 'center',
  width: '90%',
  height: '89%',
  content: '',
  grabKeys : false,
  style: {
    fg: '',
    bg: '#111125',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});


// Append our box to the screen.
screen.append(box);
screen.append(box2);

var client = new Client(argv.h, argv.nick);


// If box is focused, handle `enter`/`return` and give us some more content.
box.on('keypress', function(key, code) {
  if (key) {
    box.setContent(box.content + key);
    screen.render();
  }
});

box.key('backspace', function(ch, key) {
  if (box.content.length > 2) {
    box.setContent(box.content.substr(0, box.content.length-2));
    screen.render();
  }
});


var add = function(str) {
  var c = (box2.content + str + '\n').split('\n');

  box2.setContent(c.splice(c.length-20).join('\n'));

  screen.render();
};

box.key('enter', function(ch, key) {

  var content = box.content.replace('> ', '');
  add('>> ' + content);
  box.setContent('> ');

  if (content[0] === '/') {
    var parts = content.replace('/', '').split(' ');
    var cmd = parts.shift().toUpperCase();
    client.send(cmd, parts.join(' '));
  } else {

  }
  box.focus();
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});



client.conn.pipe(split()).on('data', add);
client.on('error', add);

// Focus our element.
box.focus();

// Render the screen.
screen.render();
screen.on('blur', console.log);
screen.on('focus', console.log);

