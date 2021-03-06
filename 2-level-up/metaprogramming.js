'use strict';

global.api = {};
api.fs = require('fs'),
api.request = require('request');

// Parse duration to seconds
// Example: duration('1d 10h 7m 13s')
//
function duration(s) {
  let result = 0;
  if (typeof(s) === 'string') {
    let days    = s.match(/(\d+)\s*d/),
        hours   = s.match(/(\d+)\s*h/),
        minutes = s.match(/(\d+)\s*m/),
        seconds = s.match(/(\d+)\s*s/);
    if (days)    result += parseInt(days[1]) * 86400;
    if (hours)   result += parseInt(hours[1]) * 3600;
    if (minutes) result += parseInt(minutes[1]) * 60;
    if (seconds) result += parseInt(seconds[1]);
    result = result * 1000;
  } if (typeof(s) === 'number') result = s;
  return result;
}

// Metadata
//
let tasks = [
  { interval: 5000, get: 'http://127.0.0.1/api/method1.json', save: 'file1.json' },
  { interval: '8s', get: 'http://127.0.0.1/api/method2.json', put: 'http://127.0.0.1/api/method4.json', save: 'file2.json' },
  { interval: '7s', get: 'http://127.0.0.1/api/method3.json', post: 'http://127.0.0.1/api/method5.json' },
  { interval: '4s', load: 'file1.json', put: 'http://127.0.0.1/api/method6.json' },
  { interval: '9s', load: 'file2.json', post: 'http://127.0.0.1/api/method7.json', save: 'file1.json' },
  { interval: '3s', load: 'file1.json', save: 'file3.json' }
];

// Metamodel
//
function iterate(tasks) {
  function closureTask(task) {
    return () => {
      console.dir(task);
      let source;
      if (task.get)  source = api.request.get(task.get);
      if (task.load) source = api.fs.createReadStream(task.load);
      if (task.save) source.pipe(api.fs.createWriteStream(task.save));
      if (task.post) source.pipe(api.request.post(task.post));
      if (task.put)  source.pipe(api.request.put(task.put));
    };
  }
  for (let i = 0; i < tasks.length; i++) {
    setInterval(closureTask(tasks[i]), duration(tasks[i].interval));
  }
}

// Execution
//
iterate(tasks);
