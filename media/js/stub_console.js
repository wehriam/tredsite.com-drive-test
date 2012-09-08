// http://frugalcoder.us/post/2009/07/22/firebug_console_stub.aspx

//define a single reference for an empty function
if (typeof Function.empty == 'undefined')
  Function.empty = function(){};

//stub out firebug console object
//        will allow console statements to be left in place
if (typeof console == 'undefined')
  console = {
    "log": Function.empty,
    "debug": Function.empty,
    "info": Function.empty,
    "warn": Function.empty,
    "error": Function.empty,
    "assert": Function.empty,
    "dir": Function.empty,
    "dirxml": Function.empty,
    "trace": Function.empty,
    "group": Function.empty,
    "groupCollapsed": Function.empty,
    "groupEnd": Function.empty,
    "time": Function.empty,
    "timeEnd": Function.empty,
    "profile": Function.empty,
    "profileEnd": Function.empty,
    "count": Function.empty
  };
