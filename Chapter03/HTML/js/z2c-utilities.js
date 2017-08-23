/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// z2c-utilities.js 

/**
 * creates a set of utilities inside the named space: z2c
 * All utilities are accessed as z2c.functionName()
 */
(function( z2c, $, undefined ) {

  // Private variables to this name space
  var languages = {}; // getSupportedLanguages
  var selectedLanguage = {}; var language;
  var textLocations = {}; // getTextLocations
  var textPrompts = {}; // getSelectedPromots

  /**
  * get the value associated with a cookie named in the input
  * @param {String} _name  - the name of the cookie to find
  * @utility
  */
  z2c.getCookieValue = function (_name)
 {
   var name = _name+"=";
   var cookie_array= document.cookie.split(";");
   for (each in cookie_array)
     { var c = cookie_array[each].trim();
       if(c.indexOf(name) == 0) return(c.substring(name.length, c.length));
     }
     return("");
 };

 /**
 * trims a string by removing all leading and trailing spaces
 * trims the final period, if it exists, from a string.
 * @param {String} _string String to be trimmed and stripped of trailing period
 * @mutility
 */
z2c.trimStrip = function (_string)
{
  var str = _string.trim();
  var len = str.length;
  if(str.endsWith(".")) {str=str.substring(0,len-1);}
  return(str);
};

/**
 * replaces text on an html page based on the anchors and text provided in a JSON textPrompts object
 * @param {String} _page - a string representing the name of the html page to be updated
 * @multi-lingual utility
 */
z2c.updatePage = function (_page)
{
  for (each in textPrompts[_page]){(function(_idx, _array)
    {$("#"+_idx).empty();$("#"+_idx).append(getDisplaytext(_page, _idx));})(each, textPrompts[_page])}
};

/**
 * gets text from the JSON object textPrompts for the requested page and item
 * @param {String} _page - string representing the name of the html page to be updated
 * @param {String} _item - string representing the html named item to be updated
 * @multi-lingual utility
 */
z2c.getDisplaytext = function (_page, _item)
{return (textPrompts[_page][_item]);};

/**
 * used to change displayed language and text
 * @param {String} _language - language to be used in this session
 * @param {String} _page - string representing html page to be updated in the selected language
 * @multi-lingual utility
 */
z2c.goMultiLingual = function (_language, _page)
{ language = _language;
  $.when($.get("/api/getSupportedLanguages")).done(function(_res)
  {languages = _res; 
    selectedLanguage = languages[_language];
    var options = {}; options.language = _language;
    $.when($.get('/api/getTextLocations'),$.post('/api/selectedPrompts', options)).done(function(_locations, _prompts)
    {textLocations = _locations;
      textPrompts = JSON.parse(_prompts[0]);
      updatePage(_page);
    });
    var _choices = $("#lang_choices");
    _choices.empty(); var _str = "";
    for (each in _res)
    {(function(_idx, _array)
      {if (_array[_idx].active == "yes")
      {_str += '<li id="'+_idx+'"><a onClick="goMultiLingual(\''+_idx+'\', \'index\')">'+_array[_idx].menu+'</a></li>'}
      })(each, _res)}
    _choices.append(_str);
  });
};

/**
 * get SupportedLanguages returns an html menu object with available languages
 * @multi-lingual utility
 */
z2c.getSupportedLanguages = function ()
{
  $.when($.get("/api/getSupportedLanguages")).done(function(_res)
  {
    languages = _res; console.log(_res); var _choices = $("#lang_choices");
    _choices.empty(); var _str = "";
    for (each in _res)
    {(function(_idx, _array)
      {if (_array[_idx].active == "yes")
      {_str += '<li id="'+_idx+'"><a onClick="goMultiLingual(\''+_idx+'\', \'index\')">'+_array[_idx].menu+'</a></li>'}
      })(each, _res)}
    _choices.append(_str);
  });
};

/**
 * returns a JSON object with the pages and objects which support text replacement
 * @multi-lingual utility
 */
z2c.getTextLocations = function ()
{$.when($.get('/api/getTextLocations')).done(function(_res){textLocations = _res; console.log(_res); });};

/**
 * returns a JSON object with the text to be used to update identified pages and objects
 * @param {String} _inbound 
 * @multi-lingual utility
 */
z2c.getSelectedPrompts = function (_inbound)
{  selectedLanguage=languages[_inbound];
  var options = {}; options.language = _inbound;
  $.when($.post('/api/selectedPrompts', options)).done(function(_res){textPrompts = _res; console.log(_res); });
};

/**
 * retrieves the prompts for the requested language from the server
 * @param {String} _inbound - string representing the requested language
 * @multi-lingual utility
 */
z2c.qOnSelectedPrompts = function (_inbound)
{
  var d_prompts = $.Deferred();
  var options = {}; options.language = _inbound;
  $.when($.post('/api/selectedPrompts', options)).done(function (p) {d_prompts.resolve(p);}).fail(d_prompts.reject);
  return d_prompts.promise();
};

/**
 * function to display the properties of an object using console.log
 * @param {Object} _obj - the object whose properties are to be displayed
 * @utility
 */
z2c.displayObjectProperties = function (_obj)
{
  for(var propt in _obj){ console.log("object property: "+propt ); }
};

/**
 * function to display the values of every property in an object. If the type of a property is object or function, then the word 'object' or 'function' is displayed
 * @param {String} _string - an arbitrary string to preface the printing of the object property name and value. often used to display the name of the object being printed
 * @param {Object} _object - the object to be introspected
 * @utility
 */
z2c.displayObjectValues = function  (_string, _object)
{
  for (prop in _object){
      console.log(_string+prop+": "+(((typeof(_object[prop]) == 'object') || (typeof(_object[prop]) == 'function'))  ? typeof(_object[prop]) : _object[prop]));
    }
};

 }( window.z2c = window.z2c || {}, jQuery ));


/**
 * get the value associated with a cookie named in the input
 * Inspired by http://bit.ly/juSAWl
 * Augment String.prototype to allow for easier formatting.  This implementation
 * doesn't completely destroy any existing String.prototype.format functions,
 * and will stringify objects/arrays.
 * @param {String} this  - the string to be formatted
 * @param {String} arg - comma delimited set of strings or ints to be inserted into this
 * @utility
 */

String.prototype.format = function(i, safe, arg) {

  function format() {
    var str = this, len = arguments.length+1;

    // For each {0} {1} {n...} replace with the argument in that position.  If
    // the argument is an object or an array it will be stringified to JSON.
    for (i=0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
      str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
    }
    return str;
  }

  // Save a reference of what may already exist under the property native.
  // Allows for doing something like: if("".format.native) { /* use native */ }
  format.native = String.prototype.format;

  // Replace the prototype property
  return format;

}();


/**
 * display the hyperledger apis as currently understood
 * @utility
 */
function showAPIDocs()
{
  $.when($.get('/resources/getDocs'),$.get('hfcAPI.html')).done(function(_res, _page)
  {
    var _target = $("#body");
    _target.empty(); _target.append(_page[0]);
    displayAPI(_res[0]);
 });
}

/**
 * 
 * @param {JSON} _api 
 */
function displayAPI(_api)
{
  var _exports = _api.hfcExports;
  var _classes = _api.hfcClasses;
  var _eTarget = $("#hfc_exports");
  var _cTarget = $("#hfc_classes");
  var _str = "";
  for (each in _exports) {
    (function(_idx, _arr){
      _curObj = Object.getOwnPropertyNames(_arr[_idx]);
      _str += "<tr><td>"+_curObj+"</td><td>"+_arr[_idx][_curObj]+"</td></tr>";
    })(each, _exports);
  }
  _eTarget.append(_str);
  _str = "";
  for (each in _classes) {
    (function(_idx, _arr){
      _curObj = Object.getOwnPropertyNames(_arr[_idx]);
      for (every in _arr[_idx][_curObj[0]]){
        (function(_idx2, _arr2)
      {
        _curObj2 = Object.getOwnPropertyNames(_arr2[_idx2]);
        _str+= "<tr><td>"+_curObj[0]+"</td><td>"+_curObj2+"</td><td>"+_arr2[_idx2][_curObj2[0]]+"</td></tr>";
      })(every, _arr[_idx][_curObj[0]])
      }
    })(each, _classes);
  }
  _cTarget.append(_str);
}